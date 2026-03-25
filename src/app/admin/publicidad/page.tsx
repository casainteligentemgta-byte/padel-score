'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { AlertCircle, Download, Eye, Loader2, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import type { MediaContent, TiraInformativa } from '@/lib/supabase/publicidad';

type CourtAssignmentRow = {
  id: string;
  venue_name: string;
  cancha_id: string;
  media_id: string;
  orden: number;
  duracion_segundos: number;
  media_content?: MediaContent | null;
};

type VenueOption = {
  name: string;
  courts: number;
};

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

  const [venues, setVenues] = useState<VenueOption[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [assignments, setAssignments] = useState<CourtAssignmentRow[]>([]);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCourtId, setAssignCourtId] = useState<string>('');
  const [assignMediaId, setAssignMediaId] = useState<string>('');
  const [assignOrden, setAssignOrden] = useState<number>(1);
  const [assignDuracion, setAssignDuracion] = useState<number>(10);

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

  const fetchVenues = useCallback(async () => {
    const all = await dataService.listAllTournaments();
    const map = new Map<string, number>();
    (all || []).forEach((t: any) => {
      const v = String(t?.complexName || '').trim();
      if (!v) return;
      const c1 = Number(t?.totalCourts || 0) || 0;
      const c2 = Array.isArray(t?.courtNames) ? t.courtNames.length : 0;
      const courts = Math.max(c1, c2, 1);
      map.set(v, Math.max(map.get(v) || 0, courts));
    });
    const result = Array.from(map.entries())
      .map(([name, courts]) => ({ name, courts }))
      .sort((a, b) => a.name.localeCompare(b.name));
    setVenues(result);
    if (!selectedVenue && result.length > 0) setSelectedVenue(result[0].name);
  }, [selectedVenue]);

  const fetchAssignments = useCallback(async (venue: string) => {
    if (!venue) {
      setAssignments([]);
      return;
    }
    const { data, error } = await supabase
      .from('cancha_publicidad')
      .select('id, venue_name, cancha_id, media_id, orden, duracion_segundos, media_content(*)')
      .eq('venue_name', venue)
      .order('cancha_id', { ascending: true })
      .order('orden', { ascending: true });
    if (error) throw error;
    setAssignments((data as CourtAssignmentRow[]) || []);
  }, [supabase]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchMedia(), fetchTicker(), fetchVenues()]);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'No se pudo cargar publicidad.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchMedia, fetchTicker, fetchVenues]);

  useEffect(() => {
    fetchAssignments(selectedVenue).catch((e: any) => setError(e?.message || 'No se pudo cargar asignaciones.'));
  }, [selectedVenue, fetchAssignments]);

  const videos = useMemo(() => mediaList.filter((m) => String(m.tipo).includes('video')), [mediaList]);
  const carrusel = useMemo(() => mediaList.filter((m) => m.tipo === 'imagen'), [mediaList]);
  const assignableMedia = useMemo(() => [...videos, ...carrusel], [videos, carrusel]);

  const selectedVenueCourts = useMemo(() => {
    const v = venues.find((x) => x.name === selectedVenue);
    const count = v?.courts || 0;
    return Array.from({ length: count }, (_, i) => `cancha_${i + 1}`);
  }, [venues, selectedVenue]);

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
    if (!confirm('Eliminar este medio?')) return;
    const { error } = await supabase.from('media_content').delete().eq('id', id);
    if (error) return setError(error.message);
    await fetchMedia();
    await fetchAssignments(selectedVenue);
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

  const openAssignModal = (canchaId: string) => {
    setAssignCourtId(canchaId);
    setAssignMediaId(assignableMedia[0]?.id || '');
    setAssignOrden(1);
    setAssignDuracion(10);
    setAssignModalOpen(true);
  };

  const saveAssignment = async () => {
    if (!selectedVenue || !assignCourtId || !assignMediaId) return;
    const { error } = await supabase.from('cancha_publicidad').insert({
      venue_name: selectedVenue,
      cancha_id: assignCourtId,
      media_id: assignMediaId,
      orden: Number(assignOrden) || 1,
      duracion_segundos: Number(assignDuracion) || 10,
    });
    if (error) return setError(error.message);
    setAssignModalOpen(false);
    await fetchAssignments(selectedVenue);
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from('cancha_publicidad').delete().eq('id', id);
    if (error) return setError(error.message);
    await fetchAssignments(selectedVenue);
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
                    <button onClick={() => setPreviewUrl(m.url)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" title="Preview"><Eye size={14} /></button>
                    <button onClick={() => download(m.url, m.nombre || m.nombre_sponsor || 'media')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" title="Download"><Download size={14} /></button>
                    <button onClick={() => deleteMedia(m.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" title="Delete"><Trash2 size={14} /></button>
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
          <header>
            <h1 className="text-3xl font-black uppercase italic">Admin Publicidad</h1>
            <p className="text-xs text-white/60 uppercase tracking-wider">Control maestro por sede y cancha</p>
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
                <button className="px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase tracking-wider flex items-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Cargar Media
                </button>
              </div>
              <p className="text-xs text-white/50">Sube video o imagen. Se guarda el tamaño para mostrar en MB.</p>
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
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              />
              <button onClick={addTicker} className="px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase">Agregar</button>
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
                        <button onClick={() => deleteTicker(t.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"><Trash2 size={14} /></button>
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
            <h2 className="text-lg md:text-xl font-black uppercase tracking-wider">Asignación por Sede</h2>
            <div className="max-w-md">
              <label className="text-[10px] uppercase text-white/60">Sede</label>
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm"
              >
                {venues.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {selectedVenueCourts.map((courtId, idx) => {
                const rows = assignments.filter((a) => a.cancha_id === courtId);
                return (
                  <div key={courtId} className="rounded-2xl border border-white/10 bg-black/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-black uppercase">Pista {idx + 1}</h3>
                      <span className="text-[10px] text-white/50">{courtId}</span>
                    </div>

                    <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-black">
                      <iframe
                        src={`/display/court/${idx + 1}`}
                        className="absolute top-0 left-0 border-0 pointer-events-none"
                        style={{
                          transform: 'scale(0.25)',
                          transformOrigin: 'top left',
                          width: '400%',
                          height: '400%',
                        }}
                        title={`preview-${courtId}`}
                      />
                    </div>

                    <div className="mt-3">
                      <p className="text-[10px] uppercase text-white/60 mb-2">Playlist</p>
                      <div className="overflow-auto rounded-xl border border-white/10">
                        <table className="w-full text-left">
                          <thead className="bg-black/40">
                            <tr>
                              <th className="px-2 py-1 text-[10px] text-white/60">Media</th>
                              <th className="px-2 py-1 text-[10px] text-white/60">Ord</th>
                              <th className="px-2 py-1 text-[10px] text-white/60">Seg</th>
                              <th className="px-2 py-1 text-[10px] text-white/60"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((r) => (
                              <tr key={r.id} className="border-t border-white/10">
                                <td className="px-2 py-1 text-[11px] text-white/90 truncate max-w-[140px]">{r.media_content?.nombre_sponsor || r.media_content?.nombre || 'Media'}</td>
                                <td className="px-2 py-1 text-[11px] text-white/70">{r.orden}</td>
                                <td className="px-2 py-1 text-[11px] text-white/70">{r.duracion_segundos}s</td>
                                <td className="px-2 py-1 text-right">
                                  <button onClick={() => removeAssignment(r.id)} className="p-1 rounded bg-red-500/10 text-red-400"><X size={12} /></button>
                                </td>
                              </tr>
                            ))}
                            {rows.length === 0 && (
                              <tr><td className="px-2 py-3 text-[11px] text-white/40 text-center" colSpan={4}>Sin medios asignados</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button
                      onClick={() => openAssignModal(courtId)}
                      className="mt-3 w-full rounded-xl bg-padel-primary text-black py-2 text-xs font-black uppercase flex items-center justify-center gap-2"
                    >
                      <Plus size={14} /> Asignar Nuevo
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase">Asignar a {assignCourtId}</h3>
              <button onClick={() => setAssignModalOpen(false)} className="p-2 rounded-lg bg-white/5"><X size={14} /></button>
            </div>
            <div>
              <label className="text-[10px] uppercase text-white/60">Media</label>
              <select value={assignMediaId} onChange={(e) => setAssignMediaId(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm">
                {assignableMedia.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre_sponsor || m.nombre || m.id}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-white/60">Orden</label>
                <input type="number" min={1} value={assignOrden} onChange={(e) => setAssignOrden(Number(e.target.value))} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-white/60">Duración (s)</label>
                <input type="number" min={1} value={assignDuracion} onChange={(e) => setAssignDuracion(Number(e.target.value))} className="w-full mt-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm" />
              </div>
            </div>
            <button onClick={saveAssignment} className="w-full rounded-xl bg-padel-primary text-black py-2 text-xs font-black uppercase">Guardar Asignación</button>
          </div>
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 relative">
            <button onClick={() => setPreviewUrl(null)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50"><X size={16} /></button>
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

