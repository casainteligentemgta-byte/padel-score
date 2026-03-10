'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { uploadToSupabase } from '@/lib/storage';
import type { MediaContent, Pantalla, TiraInformativa, MediaTipo } from '@/lib/supabase/publicidad';
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
  Download
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
    if (!supabase) return;
    const { data } = await supabase.from('tira_informativa').select('*').order('orden');
    setTiraList((data as TiraInformativa[]) || []);
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

  const syncAllScreens = async (mediaId: string | null) => {
    if (!supabase || !mediaId) return;
    setSyncing(true);
    try {
      await supabase.from('display_estado').upsert(
        pantallas.map(p => ({ pantalla_id: `${p.id}_video`, media_content_id: mediaId })),
        { onConflict: 'pantalla_id' }
      );
      const newMap = { ...displayEstado };
      pantallas.forEach(p => newMap[`${p.id}_video`] = mediaId);
      setDisplayEstado(newMap);
    } catch (e: any) {
      setError('Error al sincronizar todas las pantallas');
    } finally {
      setTimeout(() => setSyncing(false), 1000);
    }
  };

  const addMensajeTira = async () => {
    if (!supabase || !nuevoMensaje.trim()) return;
    try {
      await supabase.from('tira_informativa').insert({
        mensaje: nuevoMensaje.trim(),
        activo: true,
        orden: tiraList.length,
      });
      setNuevoMensaje('');
      await fetchTira();
    } catch (e: any) {
      setError(e?.message || 'Error al agregar mensaje');
    }
  };

  const deleteTira = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('tira_informativa').delete().eq('id', id);
      await fetchTira();
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar');
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

  const renderTable = (items: MediaContent[], accentClass: string) => (
    <div className="overflow-hidden bg-black/20 border border-white/5 rounded-[2rem]">
      <div className="max-h-[350px] overflow-y-auto custom-scroll">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0c0c0c] z-10">
            <tr className="border-b border-white/5">
              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Contenido</th>
              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Emisión</th>
              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Tiempo (s)</th>
              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Borrar</th>
              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Descargar</th>
              <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 text-center">Vista</th>
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
                  className={`group hover:bg-white/[0.02] transition-colors ${!item.activa ? 'opacity-40 grayscale-[0.5]' : ''}`}
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/5">
                        {item.tipo.includes('video') ? <Video size={14} className="text-padel-primary" /> : item.tipo === 'imagen' ? <ImageIcon size={14} className="text-blue-400" /> : item.tipo === 'url_web' ? <ExternalLink size={14} className="text-orange-400" /> : <Layers size={14} className="text-purple-400" />}
                      </div>
                      <input
                        type="text"
                        defaultValue={item.nombre_sponsor || item.nombre || 'Sin título'}
                        onBlur={(e) => updateMediaName(item.id, e.target.value)}
                        className={`bg-transparent border-none outline-none text-xs font-black uppercase tracking-tight italic text-white focus:${accentClass} group-hover:text-padel-primary transition-colors truncate max-w-[300px]`}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => toggleMediaSelection(item.id, !!item.activa)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${item.activa ? 'bg-padel-primary/40' : 'bg-white/10'}`}
                    >
                      <span
                        className={`${item.activa ? 'translate-x-5 bg-padel-primary' : 'translate-x-1 bg-gray-500'
                          } inline-block h-3 w-3 transform rounded-full transition-transform`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        defaultValue={item.duracion_segundos || 10}
                        onBlur={(e) => updateMediaDuration(item.id, parseInt(e.target.value) || 10)}
                        className="w-16 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] font-black text-center text-white outline-none focus:border-white/20"
                      />
                      <Clock size={12} className="opacity-20" />
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="p-2 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => handleDownload(item.url, (item.nombre_sponsor || item.nombre) || '')}
                      className="p-2 opacity-40 hover:opacity-100 hover:bg-white/5 rounded-xl transition-all text-white"
                      title="Descargar archivo"
                    >
                      <Download size={16} />
                    </button>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button
                      onClick={() => setPreviewUrl(item.url)}
                      className={`p-2 ${accentClass} opacity-40 hover:opacity-100 hover:bg-white/5 rounded-xl transition-all`}
                    >
                      {item.tipo.includes('video') ? <Play size={16} fill="currentColor" /> : <Eye size={16} />}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center opacity-20 italic font-bold uppercase text-[10px] tracking-widest">
                  No hay archivos en esta categoría
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
      <main className="flex-1 overflow-y-auto px-8 py-10 relative">
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

        <div className="max-w-5xl space-y-8 relative z-10">

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
              </div>

              {renderTable(animaciones, 'text-purple-400')}
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
              <h2 className="text-xl font-black uppercase italic mb-6">Tira <span className="text-padel-primary">Informativa</span></h2>
              <div className="flex gap-4 mb-8">
                <input
                  type="text"
                  placeholder="ESCRIBIR MENSAJE PARA SCROLL..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMensajeTira()}
                  className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/30 transition-all font-bold text-xs uppercase"
                />
                <button
                  onClick={addMensajeTira}
                  disabled={!nuevoMensaje.trim()}
                  className="px-6 bg-padel-primary text-black rounded-2xl font-black uppercase italic text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-3">
                {tiraList.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-padel-primary animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-tight">{t.mensaje}</span>
                    </div>
                    <button onClick={() => deleteTira(t.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
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
