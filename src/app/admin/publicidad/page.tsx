'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { uploadToSupabase } from '@/lib/storage';
import type { MediaContent, Pantalla, TiraInformativa, MediaTipo } from '@/lib/supabase/publicidad';
import { setAnimacionMarcador } from '@/lib/rtdbService';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { BouncingBall } from '@/components/BouncingBall';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  AlertCircle,
  Monitor,
  Zap,
  Play,
  Eye,
  X,
  Upload,
  Layers,
  Settings2,
  ChevronRight,
  ExternalLink,
  Search,
  Clock,
  Download,
  Star,
  Megaphone
} from 'lucide-react';

const isVideoFile = (f: File) => f.type.startsWith('video/');
const isImageFile = (f: File) => f.type.startsWith('image/');
const isAnimationFile = (f: File) => f.name.endsWith('.json') || f.type.includes('json') || f.name.toLowerCase().includes('anim');

export default function AdminPublicidad() {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [isAdmin, authLoading, router]);

  const [mediaList, setMediaList] = useState<MediaContent[]>([]);
  const [pantallas, setPantallas] = useState<Pantalla[]>([]);
  const [tiraList, setTiraList] = useState<TiraInformativa[]>([]);
  const [displayEstado, setDisplayEstado] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [urlVideo, setUrlVideo] = useState('');
  const [urlImagen, setUrlImagen] = useState('');
  const [urlAnimacion, setUrlAnimacion] = useState('');
  const [urlWeb, setUrlWeb] = useState('');
  const [nombreSponsor, setNombreSponsor] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMasterMode, setIsMasterMode] = useState(false);
  const [masterMediaId, setMasterMediaId] = useState<string | null>(null);
  const [masterCarouselId, setMasterCarouselId] = useState<string | null>(null);
  const [syncingAnimToPizarra, setSyncingAnimToPizarra] = useState(false);
  /** Asignación animación → botón del marker (1-12). 0 = sin asignar */
  const [animacionBotones, setAnimacionBotones] = useState<Record<string, number>>({});

  const supabase = useMemo(() => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return createClient();
      }
    } catch {
      // env incompleto
    }
    return null;
  }, []);

  const fetchMedia = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('media_content').select('*').order('created_at', { ascending: false });
    setMediaList((data as MediaContent[]) || []);
  }, [supabase]);

  const fetchPantallas = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('pantallas').select('*').order('nombre');
    setPantallas((data as Pantalla[]) || []);
  }, [supabase]);

  const fetchTira = useCallback(async () => {
    const res = await fetch('/api/tira-informativa');
    if (res.ok) {
      const data = await res.json();
      setTiraList((data as TiraInformativa[]) || []);
      setError(null);
      return;
    }
    if (res.status === 501 && supabase) {
      const { data, error } = await supabase.from('tira_informativa').select('*').order('orden', { ascending: true });
      if (error) {
        setError(`Tira: ${error.message}`);
        setTiraList([]);
        return;
      }
      setTiraList((data as TiraInformativa[]) || []);
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(`Tira: ${body?.error || res.statusText}`);
    setTiraList([]);
  }, [supabase]);

  const fetchDisplayEstado = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from('display_estado').select('pantalla_id, media_content_id');
    const dataArray = (data || []) as { pantalla_id: string; media_content_id: string | null }[];
    const map: Record<string, string | null> = {};
    dataArray.forEach((r) => {
      if (r.pantalla_id === 'SYSTEM_MASTER_MODE') {
        setIsMasterMode(r.media_content_id === 'true');
      } else if (r.pantalla_id === 'SYSTEM_MASTER_MEDIA_video') {
        setMasterMediaId(r.media_content_id);
      } else if (r.pantalla_id === 'SYSTEM_MASTER_CAROUSEL_carousel') {
        setMasterCarouselId(r.media_content_id);
      } else {
        map[r.pantalla_id] = r.media_content_id;
      }
    });
    setDisplayEstado(map);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setError('Configura las variables de entorno de Supabase.');
      setLoading(false);
      return;
    }
    setError(null);
    Promise.all([fetchMedia(), fetchPantallas(), fetchTira(), fetchDisplayEstado()]).finally(() =>
      setLoading(false)
    );
  }, [supabase, fetchMedia, fetchPantallas, fetchTira, fetchDisplayEstado]);

  const handleFileUpload = async (acceptedFiles: File[], type?: MediaTipo) => {
    if (!supabase || !acceptedFiles.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of acceptedFiles) {
        const url = await uploadToSupabase(file);
        let tipo = type || (isAnimationFile(file) ? 'animacion' : isVideoFile(file) ? 'video_file' : 'imagen');
        await supabase.from('media_content').insert({
          tipo,
          url,
          nombre_sponsor: file.name.split('.')[0],
          nombre: file.name,
        });
      }
      await fetchMedia();
    } catch (e: any) {
      setError(e?.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const videoDrop = useDropzone({
    onDrop: (files) => handleFileUpload(files, 'video_file'),
    accept: { 'video/*': ['.mp4', '.webm', '.mov'] },
    disabled: !supabase || uploading,
  });

  const imageDrop = useDropzone({
    onDrop: (files) => handleFileUpload(files, 'imagen'),
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
    disabled: !supabase || uploading,
  });

  const animDrop = useDropzone({
    onDrop: (files) => handleFileUpload(files, 'animacion'),
    accept: {
      'application/json': ['.json'],
      'video/*': ['.mp4', '.webm'],
      'image/*': ['.gif']
    },
    disabled: !supabase || uploading,
  });

  const videos = useMemo(() => mediaList.filter(m => m.tipo.includes('video')), [mediaList]);
  const imagenes = useMemo(() => mediaList.filter(m => m.tipo === 'imagen'), [mediaList]);
  const animaciones = useMemo(() => mediaList.filter(m => m.tipo === 'animacion'), [mediaList]);
  const webUrls = useMemo(() => mediaList.filter(m => m.tipo === 'url_web'), [mediaList]);

  const uploadByUrl = async (tipo: MediaTipo, url: string) => {
    if (!supabase || !url.trim()) return;
    setUploading(true);
    try {
      await supabase.from('media_content').insert({
        tipo,
        url: url.trim(),
        nombre_sponsor: tipo === 'video_url' ? 'Video Externo' : tipo === 'imagen' ? 'Imagen Externa' : tipo === 'url_web' ? 'Página Web' : 'Animación Externa',
        nombre: 'URL Externa',
      });
      if (tipo === 'video_url') setUrlVideo('');
      if (tipo === 'imagen') setUrlImagen('');
      if (tipo === 'animacion') setUrlAnimacion('');
      if (tipo === 'url_web') setUrlWeb('');
      await fetchMedia();
    } catch (e: any) {
      setError(e?.message || 'Error al vincular URL');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    if (!url) return;
    try {
      // Intentar forzar descarga a través de blob
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'descarga';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback: abrir en nueva pestaña
      window.open(url, '_blank');
    }
  };

  const deleteMedia = async (id: string) => {
    if (!supabase || !confirm('¿Eliminar este contenido?')) return;
    try {
      await supabase.from('media_content').delete().eq('id', id);
      await fetchMedia();
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar');
    }
  };

  const createPantalla = async () => {
    if (!supabase) return;
    const nombre = prompt('Nombre de la pantalla (ej: Pista 1, Cafetería):');
    if (!nombre) return;
    try {
      await supabase.from('pantallas').insert({ nombre, activa: true });
      await fetchPantallas();
    } catch (e: any) {
      setError('Error al crear pantalla');
    }
  };

  const setPantallaContenido = async (pantallaId: string, mediaContentId: string | null, slot: 'video' | 'carousel' = 'video') => {
    if (!supabase) return;
    const key = `${pantallaId}_${slot}`;
    try {
      if (isMasterMode && !pantallaId.startsWith('SYSTEM_MASTER')) {
        // En modo maestro global, actualizar los masters y replicar a todas las pistas
        const masterKey = slot === 'video' ? 'SYSTEM_MASTER_MEDIA_video' : 'SYSTEM_MASTER_CAROUSEL_carousel';
        const updates = [
          { pantalla_id: masterKey, media_content_id: mediaContentId },
          ...pantallas.map(p => ({ pantalla_id: `${p.id}_${slot}`, media_content_id: mediaContentId }))
        ];

        await supabase.from('display_estado').upsert(updates, { onConflict: 'pantalla_id' });

        if (slot === 'video') setMasterMediaId(mediaContentId);
        else setMasterCarouselId(mediaContentId);

        const newMap = { ...displayEstado };
        pantallas.forEach(p => newMap[`${p.id}_${slot}`] = mediaContentId);
        setDisplayEstado(newMap);
      } else {
        // Modo individual o actualización de Master directly
        await supabase.from('display_estado').upsert(
          { pantalla_id: key, media_content_id: mediaContentId },
          { onConflict: 'pantalla_id' }
        );

        if (key === 'SYSTEM_MASTER_MEDIA_video') setMasterMediaId(mediaContentId);
        if (key === 'SYSTEM_MASTER_CAROUSEL_carousel') setMasterCarouselId(mediaContentId);

        setDisplayEstado((prev) => ({ ...prev, [key]: mediaContentId }));
      }
    } catch (e: any) {
      setError(e?.message || 'Error al asignar');
    }
  };

  const toggleMasterMode = async () => {
    if (!supabase) return;
    const newMode = !isMasterMode;
    try {
      await supabase.from('display_estado').upsert(
        { pantalla_id: 'SYSTEM_MASTER_MODE', media_content_id: newMode ? 'true' : 'false' },
        { onConflict: 'pantalla_id' }
      );
      setIsMasterMode(newMode);

      if (newMode) {
        // Al activar, sincronizar todo a los masters actuales
        setSyncing(true);
        const updates: { pantalla_id: string; media_content_id: string }[] = [];
        if (masterMediaId) {
          pantallas.forEach(p => updates.push({ pantalla_id: `${p.id}_video`, media_content_id: masterMediaId }));
        }
        if (masterCarouselId) {
          pantallas.forEach(p => updates.push({ pantalla_id: `${p.id}_carousel`, media_content_id: masterCarouselId }));
        }
        if (updates.length > 0) {
          await supabase.from('display_estado').upsert(updates, { onConflict: 'pantalla_id' });
          await fetchDisplayEstado();
        }
        setSyncing(false);
      }
    } catch (e: any) {
      setError('Error al cambiar modo de control');
    }
  };

  const syncAllScreens = async (mediaId: string | null, type?: MediaTipo) => {
    if (!supabase || !mediaId) return;
    setSyncing(true);
    const slot = type === 'imagen' ? 'carousel' : 'video';
    try {
      await supabase.from('display_estado').upsert(
        pantallas.map(p => ({ pantalla_id: `${p.id}_${slot}`, media_content_id: mediaId })),
        { onConflict: 'pantalla_id' }
      );
      const newMap = { ...displayEstado };
      pantallas.forEach(p => newMap[`${p.id}_${slot}`] = mediaId);
      setDisplayEstado(newMap);
    } catch (e: any) {
      setError('Error al sincronizar todas las pantallas');
    } finally {
      setTimeout(() => setSyncing(false), 1000);
    }
  };

  const addMensajeTira = async () => {
    if (!nuevoMensaje.trim()) return;
    setError(null);
    const payload = { mensaje: nuevoMensaje.trim(), activo: true, orden: tiraList.length, pantalla_id: null };
    const res = await fetch('/api/tira-informativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      setNuevoMensaje('');
      await fetchTira();
      return;
    }
    if (res.status === 501 && supabase) {
      const { error } = await supabase.from('tira_informativa').insert(payload);
      if (error) {
        setError(`No se guardó la tira: ${error.message}`);
        return;
      }
      setNuevoMensaje('');
      await fetchTira();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(`No se guardó la tira: ${body?.error || res.statusText}`);
  };

  const deleteTira = async (id: string) => {
    const res = await fetch(`/api/tira-informativa?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchTira();
      return;
    }
    if (res.status === 501 && supabase) {
      const { error } = await supabase.from('tira_informativa').delete().eq('id', id);
      if (error) {
        setError(error.message || 'Error al eliminar');
        return;
      }
      await fetchTira();
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body?.error || 'Error al eliminar');
  };

  const updateTiraOrden = async (id: string, nuevoOrden: number) => {
    const res = await fetch('/api/tira-informativa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, orden: nuevoOrden }),
    });
    if (res.ok) {
      await fetchTira();
      return;
    }
    if (res.status === 501 && supabase) {
      const { error } = await supabase.from('tira_informativa').update({ orden: nuevoOrden }).eq('id', id);
      if (error) {
        setError('Error al actualizar orden');
        return;
      }
      await fetchTira();
      return;
    }
    setError('Error al actualizar orden');
  };

  const updateTiraPantalla = async (id: string, pantallaId: string | null) => {
    const res = await fetch('/api/tira-informativa', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, pantalla_id: pantallaId }),
    });
    if (res.ok) {
      await fetchTira();
      return;
    }
    if (res.status === 501 && supabase) {
      const { error } = await supabase.from('tira_informativa').update({ pantalla_id: pantallaId }).eq('id', id);
      if (error) {
        setError('Error al actualizar pantalla de la tira');
        return;
      }
      await fetchTira();
      return;
    }
    setError('Error al actualizar pantalla de la tira');
  };

  const syncAnimacionesToPizarra = async () => {
    const assigned = animaciones.filter(a => animacionBotones[a.id] >= 1 && animacionBotones[a.id] <= 12);
    if (assigned.length === 0) {
      setError('Asigna al menos una animación a un botón (1–12) del marcador.');
      return;
    }
    setSyncingAnimToPizarra(true);
    setError(null);
    try {
      const byButton: Record<number, MediaContent> = {};
      assigned.forEach(a => { byButton[animacionBotones[a.id]] = a; });
      for (let btn = 1; btn <= 12; btn++) {
        const item = byButton[btn];
        if (item) {
          await setAnimacionMarcador(String(btn), {
            nombre: (item.nombre_sponsor || item.nombre || `Botón ${btn}`).slice(0, 80),
            url: item.url,
          });
        } else {
          await setAnimacionMarcador(String(btn), null);
        }
      }
      setError(null);
      alert(`Sincronizado: ${assigned.length} animación(es) en los botones del marcador.`);
    } catch (e: any) {
      setError(e?.message || 'Error al sincronizar con la pizarra. ¿Tienes Firebase RTDB configurado?');
    } finally {
      setSyncingAnimToPizarra(false);
    }
  };

  const toggleMediaSelection = async (id: string, currentStatus: boolean) => {
    if (!supabase) return;
    try {
      await supabase.from('media_content').update({ activa: !currentStatus }).eq('id', id);
      setMediaList(prev => prev.map(item => item.id === id ? { ...item, activa: !currentStatus } : item));
    } catch (e: any) {
      setError('Error al actualizar estado de emisión');
    }
  };

  const updateMediaDuration = async (id: string, segundos: number) => {
    if (!supabase) return;
    try {
      await supabase.from('media_content').update({ duracion_segundos: segundos }).eq('id', id);
      setMediaList(prev => prev.map(item => item.id === id ? { ...item, duracion_segundos: segundos } : item));
    } catch (e: any) {
      setError('Error al actualizar duración');
    }
  };

  const updateMediaName = async (id: string, nuevoNombre: string) => {
    if (!supabase || !nuevoNombre.trim()) return;
    try {
      await supabase.from('media_content').update({ nombre_sponsor: nuevoNombre.trim() }).eq('id', id);
      setMediaList(prev => prev.map(item => item.id === id ? { ...item, nombre_sponsor: nuevoNombre.trim() } : item));
    } catch (e: any) {
      setError('Error al actualizar nombre');
    }
  };

  const isMediaAssignedToScreen = (mediaId: string, pantallaId: string, type: MediaTipo) => {
    const slot = type === 'imagen' ? 'carousel' : 'video';
    const key = `${pantallaId}_${slot}`;
    // Check for suffixed key OR legacy bare key (if video slot)
    return displayEstado[key] === mediaId || (slot === 'video' && displayEstado[pantallaId] === mediaId);
  };

  const areAllScreensAssigned = (mediaId: string, type: MediaTipo) => {
    if (pantallas.length === 0) return false;
    return pantallas.every(p => isMediaAssignedToScreen(mediaId, p.id, type));
  };

  const renderTable = (items: MediaContent[], accentClass: string) => (
    <div className="overflow-hidden bg-black/20 border border-white/5 rounded-[2rem]">
      <div className="max-h-[350px] overflow-y-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0c0c0c] z-10">
                <tr className="border-b border-white/5">
                  <th className="px-3 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 min-w-[200px] w-[220px]">Contenido</th>
                  <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[110px]">Asignar</th>
                  <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[45px]">Emisión</th>
                  <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[55px]">Tiempo</th>
                  <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-8"></th>
                  <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-8"></th>
                  <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`group hover:bg-white/[0.02] transition-colors ${item.activa === false ? 'opacity-40 grayscale-[0.5]' : ''}`}
                    >
                    <td className="px-3 py-3 min-w-[220px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="shrink-0 w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                          {item.tipo.includes('video') ? <Video size={10} className="text-padel-primary" /> : item.tipo === 'imagen' ? <ImageIcon size={10} className="text-blue-400" /> : item.tipo === 'url_web' ? <ExternalLink size={10} className="text-orange-400" /> : <Layers size={10} className="text-purple-400" />}
                        </div>
                        <input
                          type="text"
                          defaultValue={item.nombre_sponsor || item.nombre || 'Sin título'}
                          onBlur={(e) => updateMediaName(item.id, e.target.value)}
                          className={`bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-tight italic text-white focus:${accentClass} group-hover:text-padel-primary transition-colors w-full min-w-0 max-w-[200px]`}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1 max-w-[110px] mx-auto">
                        <button
                          onClick={() => syncAllScreens(item.id, item.tipo)}
                          className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg border transition-all duration-300 ${areAllScreensAssigned(item.id, item.tipo) ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_8px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'}`}
                          title="Todas las pantallas"
                        >
                          <span className="text-[10px] font-black uppercase tracking-tight">T</span>
                        </button>
                        {pantallas.map((p, idx) => {
                          const isAssigned = isMediaAssignedToScreen(item.id, p.id, item.tipo);
                          const num = (p.nombre.match(/\d+/) || [idx + 1])[0];
                          return (
                            <button
                              key={`${item.id}-${p.id}`}
                              onClick={() => setPantallaContenido(p.id, item.id, item.tipo === 'imagen' ? 'carousel' : 'video')}
                              className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg border transition-all duration-300 ${isAssigned ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'}`}
                              title={p.nombre}
                            >
                              <span className="text-[10px] font-black uppercase tracking-tight">{num}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={() => toggleMediaSelection(item.id, !!item.activa)}
                      className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors focus:outline-none ${item.activa !== false ? 'bg-padel-primary/40' : 'bg-white/10'}`}
                    >
                      <span
                        className={`${item.activa !== false ? 'translate-x-3.5 bg-padel-primary' : 'translate-x-0.5 bg-gray-500'
                          } inline-block h-2.5 w-2.5 transform rounded-full transition-transform`}
                      />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        defaultValue={item.duracion_segundos || 10}
                        onBlur={(e) => updateMediaDuration(item.id, parseInt(e.target.value) || 10)}
                        className="w-10 bg-black/40 border border-white/10 rounded-lg px-1 py-1 text-[8px] font-black text-center text-white outline-none focus:border-white/20"
                      />
                    </div>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="p-1 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <button
                      onClick={() => handleDownload(item.url, (item.nombre_sponsor || item.nombre) || '')}
                      className="p-1 opacity-40 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all text-white"
                      title="Descargar archivo"
                    >
                      <Download size={12} />
                    </button>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <button
                      onClick={() => setPreviewUrl(item.url)}
                      className={`p-1 ${accentClass} opacity-40 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all`}
                    >
                      {item.tipo.includes('video') ? <Play size={12} fill="currentColor" /> : <Eye size={12} />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-8 py-20 text-center opacity-20 italic font-bold uppercase text-[10px] tracking-widest">
                  No hay archivos en esta categoría
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnimacionesTable = () => (
    <div className="overflow-hidden bg-black/20 border border-white/5 rounded-[2rem]">
      <div className="max-h-[350px] overflow-y-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0c0c0c] z-10">
            <tr className="border-b border-white/5">
              <th className="px-3 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 min-w-[200px] w-[220px]">Contenido</th>
              <th className="px-2 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[100px]">Botón marker</th>
              <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[110px]">Asignar</th>
              <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[45px]">Emisión</th>
              <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-[55px]">Tiempo</th>
              <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-8"></th>
              <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-8"></th>
              <th className="px-1 py-3 text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 text-center w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            <AnimatePresence>
              {animaciones.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`group hover:bg-white/[0.02] transition-colors ${item.activa === false ? 'opacity-40 grayscale-[0.5]' : ''}`}
                >
                  <td className="px-3 py-3 min-w-[220px]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="shrink-0 w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                        <Layers size={10} className="text-purple-400" />
                      </div>
                      <input
                        type="text"
                        defaultValue={item.nombre_sponsor || item.nombre || 'Sin título'}
                        onBlur={(e) => updateMediaName(item.id, e.target.value)}
                        className="bg-transparent border-none outline-none text-[9px] font-black uppercase tracking-tight italic text-white focus:text-purple-400 group-hover:text-padel-primary transition-colors w-full min-w-0 max-w-[200px]"
                      />
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <select
                      value={animacionBotones[item.id] || 0}
                      onChange={(e) => setAnimacionBotones(prev => ({ ...prev, [item.id]: Number(e.target.value) }))}
                      className="bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[9px] font-black text-white outline-none focus:border-purple-400/50 w-full max-w-[90px]"
                    >
                      <option value={0}>—</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                        <option key={n} value={n}>Botón {n}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1 max-w-[110px] mx-auto">
                      <button
                        onClick={() => syncAllScreens(item.id, item.tipo)}
                        className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg border transition-all duration-300 ${areAllScreensAssigned(item.id, item.tipo) ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_8px_rgba(204,255,0,0.3)]' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'}`}
                        title="Todas las pantallas"
                      >
                        <span className="text-[10px] font-black uppercase tracking-tight">T</span>
                      </button>
                      {pantallas.map((p, idx) => {
                        const isAssigned = isMediaAssignedToScreen(item.id, p.id, item.tipo);
                        const num = (p.nombre.match(/\d+/) || [idx + 1])[0];
                        return (
                          <button
                            key={`${item.id}-${p.id}`}
                            onClick={() => setPantallaContenido(p.id, item.id, item.tipo === 'imagen' ? 'carousel' : 'video')}
                            className={`flex items-center justify-center shrink-0 w-7 h-7 rounded-lg border transition-all duration-300 ${isAssigned ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'}`}
                            title={p.nombre}
                          >
                            <span className="text-[10px] font-black uppercase tracking-tight">{num}</span>
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <button
                      onClick={() => toggleMediaSelection(item.id, !!item.activa)}
                      className={`relative inline-flex h-3.5 w-7 items-center rounded-full transition-colors focus:outline-none ${item.activa !== false ? 'bg-padel-primary/40' : 'bg-white/10'}`}
                    >
                      <span
                        className={`${item.activa !== false ? 'translate-x-3.5 bg-padel-primary' : 'translate-x-0.5 bg-gray-500'
                          } inline-block h-2.5 w-2.5 transform rounded-full transition-transform`}
                      />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        defaultValue={item.duracion_segundos || 10}
                        onBlur={(e) => updateMediaDuration(item.id, parseInt(e.target.value) || 10)}
                        className="w-10 bg-black/40 border border-white/10 rounded-lg px-1 py-1 text-[8px] font-black text-center text-white outline-none focus:border-white/20"
                      />
                    </div>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="p-1 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <button
                      onClick={() => handleDownload(item.url, (item.nombre_sponsor || item.nombre) || '')}
                      className="p-1 opacity-40 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all text-white"
                      title="Descargar archivo"
                    >
                      <Download size={12} />
                    </button>
                  </td>
                  <td className="px-1 py-3 text-center">
                    <button
                      onClick={() => setPreviewUrl(item.url)}
                      className="p-1 text-purple-400 opacity-40 hover:opacity-100 hover:bg-white/5 rounded-lg transition-all"
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {animaciones.length === 0 && (
              <tr>
                <td colSpan={8} className="px-8 py-20 text-center opacity-20 italic font-bold uppercase text-[10px] tracking-widest">
                  No hay animaciones. Carga o vincula alguna arriba.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (authLoading || loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-outfit selection:bg-padel-primary selection:text-black">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-8 relative">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-padel-primary/10 blur-[130px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        </div>

        {/* Global Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 relative z-10">
          <div className="flex items-center gap-4">
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-padel-primary italic opacity-70">Multimedia Control Tower</h4>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <span className="text-padel-primary">SMART</span> PADEL
                <div className="mb-2">
                  <BouncingBall size={20} />
                </div>
                <span className="text-white/20 not-italic">ADS</span>
              </h1>
            </div>
          </div>
        </header>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center gap-4 bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-2xl relative z-10"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
          </motion.div>
        )}

        <div className="max-w-6xl space-y-8 relative z-10 mx-auto">

          {/* LIBRARY SECTIONS */}
          <div className="space-y-8">
            {/* VIDEOS SECTION */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 tracking-widest">
                BIBLIOTECA DE <span className="text-padel-primary">VIDEOS</span>
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div {...videoDrop.getRootProps()} className="cursor-pointer">
                  <input {...videoDrop.getInputProps()} />
                  <div className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-padel-primary" />}
                    Cargar Videos
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] relative">
                  <input
                    type="text"
                    placeholder="Vincular URL de Video..."
                    value={urlVideo}
                    onChange={(e) => setUrlVideo(e.target.value)}
                    className="w-full bg-transparent border-none outline-none px-6 py-3 font-bold text-xs uppercase italic text-white/80 placeholder:text-white/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <LinkIcon className="w-3 h-3 text-white/20" />
                  </div>
                </div>

                <button
                  onClick={() => uploadByUrl('video_url', urlVideo)}
                  disabled={!urlVideo.trim() || uploading}
                  className="px-8 py-3.5 bg-padel-primary text-black rounded-2xl font-black uppercase italic text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  Subir
                </button>
              </div>

              {renderTable(videos, 'text-padel-primary')}
            </section>

            {/* IMAGES SECTION */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 tracking-widest">
                BIBLIOTECA DE <span className="text-blue-400">IMÁGENES</span>
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div {...imageDrop.getRootProps()} className="cursor-pointer">
                  <input {...imageDrop.getInputProps()} />
                  <div className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-blue-400" />}
                    Cargar Imágenes
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] relative">
                  <input
                    type="text"
                    placeholder="Vincular URL de Imagen..."
                    value={urlImagen}
                    onChange={(e) => setUrlImagen(e.target.value)}
                    className="w-full bg-transparent border-none outline-none px-6 py-3 font-bold text-xs uppercase italic text-white/80 placeholder:text-white/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <LinkIcon className="w-3 h-3 text-white/20" />
                  </div>
                </div>

                <button
                  onClick={() => uploadByUrl('imagen', urlImagen)}
                  disabled={!urlImagen.trim() || uploading}
                  className="px-8 py-3.5 bg-blue-500 text-white rounded-2xl font-black uppercase italic text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  Subir
                </button>
              </div>

              {renderTable(imagenes, 'text-blue-400')}
            </section>

            {/* ANIMATIONS SECTION */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 tracking-widest">
                BIBLIOTECA DE <span className="text-purple-400">ANIMACIONES</span>
              </h2>

              <div className="mb-6 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400/90 mb-2">Recomendaciones para que corran bien en la pizarra</p>
                <ul className="text-[11px] text-white/80 space-y-1.5 list-disc list-inside">
                  <li><strong>Formato:</strong> Lottie (.json) preferido — ligero y fluido. También MP4/WebM para vídeos cortos (&lt; 2–3 MB) o GIF/WebP (&lt; 1 MB).</li>
                  <li><strong>Tamaño:</strong> Lottie &lt; 500 KB; vídeo &lt; 2–3 MB por clip; imagen/GIF &lt; 1 MB.</li>
                  <li><strong>Resolución:</strong> 1920×1080 o 1280×720. Lottie escala solo.</li>
                </ul>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div {...animDrop.getRootProps()} className="cursor-pointer">
                  <input {...animDrop.getInputProps()} />
                  <div className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase italic text-[10px] flex items-center gap-2 transition-all">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-purple-400" />}
                    Cargar Animaciones
                  </div>
                </div>

                <div className="flex-1 min-w-[200px] relative">
                  <input
                    type="text"
                    placeholder="Vincular URL de Animación..."
                    value={urlAnimacion}
                    onChange={(e) => setUrlAnimacion(e.target.value)}
                    className="w-full bg-transparent border-none outline-none px-6 py-3 font-bold text-xs uppercase italic text-white/80 placeholder:text-white/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <LinkIcon className="w-3 h-3 text-white/20" />
                  </div>
                </div>

                <button
                  onClick={() => uploadByUrl('animacion', urlAnimacion)}
                  disabled={!urlAnimacion.trim() || uploading}
                  className="px-8 py-3.5 bg-purple-500 text-white rounded-2xl font-black uppercase italic text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  Subir
                </button>

                <button
                  onClick={syncAnimacionesToPizarra}
                  disabled={syncingAnimToPizarra || animaciones.length === 0}
                  className="flex items-center gap-2 px-6 py-3.5 bg-padel-primary/20 border border-padel-primary/40 text-padel-primary rounded-2xl font-black uppercase italic text-[10px] hover:bg-padel-primary/30 transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {syncingAnimToPizarra ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Sincronizar con pizarra
                </button>
              </div>
              <p className="text-[10px] text-white/50 mb-6">Asigna cada animación a un botón del marcador (1–12). Luego pulsa &quot;Sincronizar con pizarra&quot;. En el partido el marcador verá esos botones y al pulsar se mostrará la animación en la pizarra.</p>

              {renderAnimacionesTable()}
            </section>

            {/* WEB URL SECTION */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8 tracking-widest">
                BIBLIOTECA DE <span className="text-orange-400">PÁGINAS WEB</span>
              </h2>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <div className="flex-1 min-w-[300px] relative">
                  <input
                    type="text"
                    placeholder="Vincular URL Externa (Dashboard, Web, etc.)..."
                    value={urlWeb}
                    onChange={(e) => setUrlWeb(e.target.value)}
                    className="w-full bg-transparent border-none outline-none px-6 py-3 font-bold text-xs uppercase italic text-white/80 placeholder:text-white/20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <ExternalLink className="w-3 h-3 text-white/20" />
                  </div>
                </div>

                <button
                  onClick={() => uploadByUrl('url_web', urlWeb)}
                  disabled={!urlWeb.trim() || uploading}
                  className="px-8 py-3.5 bg-orange-500 text-white rounded-2xl font-black uppercase italic text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  Subir
                </button>
              </div>

              {renderTable(webUrls, 'text-orange-400')}
            </section>

            {/* MARQUEE SECTION */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter tracking-widest">
                    Tira <span className="text-padel-primary">Informativa</span>
                  </h2>
                  <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Gestión de noticias y anuncios en scroll</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-padel-primary/10 flex items-center justify-center border border-padel-primary/20">
                  <Megaphone className="w-6 h-6 text-padel-primary" />
                </div>
              </div>

              <div className="flex gap-4 mb-10 group">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Escribe una noticia o anuncio importante..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addMensajeTira()}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-8 py-5 outline-none focus:border-padel-primary/50 transition-all font-black text-xs uppercase text-white placeholder:text-white/10 shadow-inner"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-padel-primary" />
                  </div>
                </div>
                <button
                  onClick={addMensajeTira}
                  disabled={!nuevoMensaje.trim()}
                  className="px-10 bg-padel-primary text-black rounded-2xl font-black uppercase italic text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale shadow-[0_0_20px_rgba(204,255,0,0.1)]"
                >
                  Agregar
                </button>
              </div>

              {/* Live Preview */}
              {tiraList.length > 0 && (
                <div className="mb-10 p-1 bg-gradient-to-r from-padel-primary/20 via-transparent to-padel-primary/20 rounded-xl overflow-hidden">
                  <div className="bg-black/60 py-3 overflow-hidden relative">
                    <div className="flex whitespace-nowrap animate-marquee">
                      {tiraList.map((t, idx) => (
                        <div key={t.id} className="flex items-center px-8">
                          <Star className="w-3 h-3 text-padel-primary mr-3 fill-padel-primary/20" />
                          <span className="text-[10px] font-black italic uppercase tracking-widest text-white/80">{t.mensaje}</span>
                        </div>
                      ))}
                      {/* Duplicate for loop */}
                      {tiraList.map((t, idx) => (
                        <div key={`dup-${t.id}`} className="flex items-center px-8">
                          <Star className="w-3 h-3 text-padel-primary mr-3 fill-padel-primary/20" />
                          <span className="text-[10px] font-black italic uppercase tracking-widest text-white/80">{t.mensaje}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {tiraList.map((t, index) => (
                    <motion.div
                      key={t.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group flex items-center justify-between p-5 bg-black/40 border border-white/5 rounded-2xl hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => index > 0 && updateTiraOrden(t.id, index - 1)}
                            disabled={index === 0}
                            className="p-1 hover:text-padel-primary disabled:opacity-0 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3 -rotate-90" />
                          </button>
                          <button
                            onClick={() => index < tiraList.length - 1 && updateTiraOrden(t.id, index + 1)}
                            disabled={index === tiraList.length - 1}
                            className="p-1 hover:text-padel-primary disabled:opacity-0 transition-colors"
                          >
                            <ChevronRight className="w-3 h-3 rotate-90" />
                          </button>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-padel-primary group-hover:shadow-[0_0_10px_rgba(204,255,0,0.5)] transition-shadow" />
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-black uppercase tracking-tight text-white/90 group-hover:text-white transition-colors">{t.mensaje}</span>
                          <div className="flex flex-wrap items-center gap-1.5 max-w-[300px] md:max-w-none pb-1">
                            <button
                              onClick={() => updateTiraPantalla(t.id, null)}
                              className={`flex items-center shrink-0 gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${!t.pantalla_id ? 'bg-padel-primary text-black border-padel-primary shadow-[0_0_15px_rgba(204,255,0,0.4)] scale-105' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10 hover:text-white/40'}`}
                            >
                              <Zap size={10} className={!t.pantalla_id ? 'text-black animate-pulse' : 'text-gray-600'} />
                              <span className="text-[8px] font-black uppercase tracking-tight">Todas</span>
                            </button>
                            {pantallas.map(p => (
                              <button
                                key={`${t.id}-${p.id}`}
                                onClick={() => updateTiraPantalla(t.id, p.id)}
                                className={`flex items-center shrink-0 gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 ${t.pantalla_id === p.id ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-105' : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10 hover:text-white/40'}`}
                              >
                                <Monitor size={10} className={t.pantalla_id === p.id ? 'text-white animate-pulse' : 'text-gray-600'} />
                                <span className="text-[8px] font-black uppercase tracking-tight whitespace-nowrap">{p.nombre}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTira(t.id)}
                        className="p-3 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {tiraList.length === 0 && (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-20 italic font-black uppercase text-[9px] tracking-[0.3em]">
                    No hay mensajes activos en la tira
                  </div>
                )}
              </div>
            </section>

            {/* SCREEN MONITORING HUB */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center border border-orange-500/20">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black uppercase italic tracking-tighter">Monitoreo <span className="text-orange-400">Hub</span></h2>
                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-0.5">Control de emisión en tiempo real</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={createPantalla}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"
                  >
                    + Agregar Pantalla
                  </button>

                  {/* Master Mode Switch */}
                  <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-2 rounded-2xl">
                    <div className="flex bg-white/5 rounded-xl p-1">
                      <button
                        onClick={() => !isMasterMode && toggleMasterMode()}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!isMasterMode ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}
                      >
                        Individual
                      </button>
                      <button
                        onClick={() => isMasterMode && toggleMasterMode()}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isMasterMode ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-white/30 hover:text-white/50'}`}
                      >
                        Espejo (Global)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Master Selectors when in Master Mode */}
              <AnimatePresence mode="wait">
                {isMasterMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-8 p-8 border-2 border-padel-primary/30 bg-padel-primary/5 rounded-[2rem] space-y-6"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-padel-primary animate-pulse" />
                      <h3 className="text-sm font-black uppercase italic">Control Maestro Global</h3>
                      <span className="ml-4 text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Todas las pantallas sincronizadas</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-padel-primary/60 tracking-widest ml-1">Video Principal Maestro</label>
                        <select
                          value={masterMediaId || ''}
                          onChange={(e) => setPantallaContenido('SYSTEM_MASTER_MEDIA', e.target.value || null, 'video')}
                          className="w-full bg-black/60 border border-padel-primary/30 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-padel-primary cursor-pointer text-padel-primary"
                        >
                          <option value="">SIN VIDEO (STANDBY)...</option>
                          {videos.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre_sponsor || m.nombre}</option>
                          ))}
                          {webUrls.length > 0 && <optgroup label="PÁGINAS WEB">
                            {webUrls.map(m => (
                              <option key={m.id} value={m.id}>WEB: {m.nombre_sponsor || m.nombre}</option>
                            ))}
                          </optgroup>}
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[9px] font-black uppercase text-blue-400/60 tracking-widest ml-1">Carrusel de Imágenes Maestro</label>
                        <select
                          value={masterCarouselId || ''}
                          onChange={(e) => setPantallaContenido('SYSTEM_MASTER_CAROUSEL', e.target.value || null, 'carousel')}
                          className="w-full bg-black/60 border border-blue-400/30 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-blue-400 cursor-pointer text-blue-400"
                        >
                          <option value="">SIN IMAGEN (STANDBY)...</option>
                          {imagenes.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre_sponsor || m.nombre}</option>
                          ))}
                          {webUrls.length > 0 && <optgroup label="PÁGINAS WEB">
                            {webUrls.map(m => (
                              <option key={m.id} value={m.id}>WEB: {m.nombre_sponsor || m.nombre}</option>
                            ))}
                          </optgroup>}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pantallas.length === 0 && (
                  <div className="col-span-full py-20 bg-black/20 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center">
                    <Monitor className="w-12 h-12 text-white/5 mb-4" />
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">No hay pistas registradas en el Monitor Hub</p>
                    <button onClick={createPantalla} className="mt-4 text-padel-primary text-[10px] font-black uppercase underline">Agregar la primera ahora</button>
                  </div>
                )}
                {pantallas.map((p) => {
                  const currentVideoId = displayEstado[`${p.id}_video`];
                  const currentCarouselId = displayEstado[`${p.id}_carousel`];
                  return (
                    <div key={p.id} className={`bg-black/40 border rounded-3xl p-6 relative group transition-all ${isMasterMode ? 'border-white/5 opacity-50 grayscale' : 'border-white/5 hover:border-white/20'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h4 className="text-[11px] font-black uppercase text-white tracking-widest">{p.nombre}</h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${p.activa ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest">{p.activa ? 'EN LÍNEA' : 'DESCONECTADO'}</span>
                          </div>
                        </div>
                        {isMasterMode && (
                          <div className="px-2 py-1 bg-padel-primary/10 border border-padel-primary/20 rounded-md">
                            <Zap size={10} className="text-padel-primary" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-1">Zona Video</span>
                          <select
                            disabled={isMasterMode}
                            value={currentVideoId || ''}
                            onChange={(e) => setPantallaContenido(p.id, e.target.value || null, 'video')}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest outline-none focus:border-white/30 appearance-none cursor-pointer disabled:cursor-not-allowed"
                          >
                            <option value="">{isMasterMode ? 'ESPEJO ACTIVO' : 'SELECCIONAR VIDEO'}</option>
                            {videos.map(m => (
                              <option key={m.id} value={m.id}>{m.nombre_sponsor || m.nombre}</option>
                            ))}
                            {webUrls.length > 0 && <optgroup label="PÁGINAS WEB">
                              {webUrls.map(m => (
                                <option key={m.id} value={m.id}>WEB: {m.nombre_sponsor || m.nombre}</option>
                              ))}
                            </optgroup>}
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[8px] font-black uppercase tracking-widest text-white/20 ml-1">Zona Carrusel</span>
                          <select
                            disabled={isMasterMode}
                            value={currentCarouselId || ''}
                            onChange={(e) => setPantallaContenido(p.id, e.target.value || null, 'carousel')}
                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest outline-none focus:border-white/30 appearance-none cursor-pointer disabled:cursor-not-allowed"
                          >
                            <option value="">{isMasterMode ? 'ESPEJO ACTIVO' : 'SELECCIONAR IMAGEN'}</option>
                            {imagenes.map(m => (
                              <option key={m.id} value={m.id}>{m.nombre_sponsor || m.nombre}</option>
                            ))}
                            {webUrls.length > 0 && <optgroup label="PÁGINAS WEB">
                              {webUrls.map(m => (
                                <option key={m.id} value={m.id}>WEB: {m.nombre_sponsor || m.nombre}</option>
                              ))}
                            </optgroup>}
                          </select>
                        </div>
                      </div>

                      {/* Dual Slot Live Monitor */}
                      <div className="mt-6 flex gap-2 h-32">
                        {/* Video Slot Preview */}
                        <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 overflow-hidden relative group/preview">
                          <AnimatePresence mode="wait">
                            {currentVideoId ? (
                              <motion.div key={currentVideoId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                                {videos.find(v => v.id === currentVideoId)?.url ? (
                                  <video src={videos.find(v => v.id === currentVideoId)?.url} className="w-full h-full object-cover opacity-60" muted loop autoPlay playsInline />
                                ) : webUrls.find(w => w.id === currentVideoId)?.url ? (
                                  <div className="w-full h-full flex items-center justify-center p-2">
                                    <ExternalLink size={16} className="text-orange-400/40" />
                                  </div>
                                ) : imagenes.find(i => i.id === currentVideoId)?.url ? (
                                  <img src={imagenes.find(i => i.id === currentVideoId)?.url} className="w-full h-full object-cover opacity-40" />
                                ) : null}
                              </motion.div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-10">
                                <Video size={16} />
                              </div>
                            )}
                          </AnimatePresence>
                          <div className="absolute top-1.5 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[5px] font-black uppercase tracking-widest text-white/50">VIDEO</div>
                        </div>

                        {/* Carousel Slot Preview */}
                        <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 overflow-hidden relative group/preview">
                          <AnimatePresence mode="wait">
                            {currentCarouselId ? (
                              <motion.div key={currentCarouselId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full">
                                {imagenes.find(i => i.id === currentCarouselId)?.url ? (
                                  <img src={imagenes.find(i => i.id === currentCarouselId)?.url} className="w-full h-full object-cover opacity-60" />
                                ) : webUrls.find(w => w.id === currentCarouselId)?.url ? (
                                  <div className="w-full h-full flex items-center justify-center p-2">
                                    <ExternalLink size={16} className="text-orange-400/40" />
                                  </div>
                                ) : videos.find(v => v.id === currentCarouselId)?.url ? (
                                  <video src={videos.find(v => v.id === currentCarouselId)?.url} className="w-full h-full object-cover opacity-40" muted loop autoPlay playsInline />
                                ) : null}
                              </motion.div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-10">
                                <ImageIcon size={16} />
                              </div>
                            )}
                          </AnimatePresence>
                          <div className="absolute top-1.5 left-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-md rounded text-[5px] font-black uppercase tracking-widest text-white/50">CARRUSEL</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isMasterMode && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => syncAllScreens(Object.values(displayEstado)[0] || null)}
                  className="w-full mt-10 bg-white/5 hover:bg-white/10 text-white/70 py-5 rounded-2xl font-black uppercase italic text-xs border border-white/5 flex items-center justify-center gap-3 transition-all"
                >
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin text-padel-primary" /> : <Zap size={18} className="text-padel-primary" />}
                  {syncing ? 'Sincronizando...' : 'Sincronizar todas las pantallas'}
                </motion.button>
              )}
            </section>
          </div>
        </div>

      </main>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {!!previewUrl && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewUrl(null)} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative z-10 w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-3xl border border-white/10">
              <div className="absolute top-6 right-6 flex gap-3 z-20">
                <button
                  onClick={() => handleDownload(previewUrl!, 'preview_content')}
                  className="p-2 bg-black/50 hover:bg-black rounded-full text-white transition-all border border-white/10"
                  title="Descargar"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-2 bg-black/50 hover:bg-black rounded-full text-white transition-all border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>
              {previewUrl.match(/\.(mp4|webm|mov|m4v)/i) ? (
                <video src={previewUrl} className="w-full h-full" controls autoPlay />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8">
                  <img src={previewUrl} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl shadow-blue-500/10" alt="" />
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
        .font-outfit { font-family: 'Outfit', sans-serif; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(204,255,0,0.1); }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(204,255,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
