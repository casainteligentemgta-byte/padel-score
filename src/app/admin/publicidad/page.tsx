'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { createClient } from '@/lib/supabase/client';
import { uploadToSupabase } from '@/lib/storage';
import type { MediaContent, Pantalla, TiraInformativa } from '@/lib/supabase/publicidad';
import Sidebar from '@/components/Sidebar';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
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
} from 'lucide-react';

const isVideoFile = (f: File) => f.type.startsWith('video/');
const isImageFile = (f: File) => f.type.startsWith('image/');

export default function AdminPublicidad() {
  const { isAdmin, loading: authLoading } = useAuth();
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
  const [nombreSponsor, setNombreSponsor] = useState('');
  const [syncing, setSyncing] = useState(false);

  const supabase = useMemo(() => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return createClient();
      }
    } catch {
      // env incompleto o clave inválida
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
    const map: Record<string, string | null> = {};
    (data || []).forEach((r: { pantalla_id: string; media_content_id: string | null }) => {
      map[r.pantalla_id] = r.media_content_id;
    });
    setDisplayEstado(map);
  }, [supabase]);

  /** Pantallas con el contenido actual (url, nombre_sponsor) para miniaturas */
  const pantallasWithMedia = useMemo(() => {
    return pantallas.map((p) => {
      const mediaId = displayEstado[p.id] ?? null;
      const media = mediaId ? mediaList.find((m) => m.id === mediaId) : null;
      return {
        ...p,
        isOnline: p.activa,
        media_contents: media
          ? { url: media.url, nombre_sponsor: media.nombre_sponsor ?? null, tipo: media.tipo }
          : null,
      };
    });
  }, [pantallas, displayEstado, mediaList]);

  useEffect(() => {
    if (!supabase) {
      setError('Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
      setLoading(false);
      return;
    }
    setError(null);
    Promise.all([fetchMedia(), fetchPantallas(), fetchTira(), fetchDisplayEstado()]).finally(() =>
      setLoading(false)
    );
  }, [supabase, fetchMedia, fetchPantallas, fetchTira, fetchDisplayEstado]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!supabase || !acceptedFiles.length) return;
      setUploading(true);
      setError(null);
      try {
        for (const file of acceptedFiles) {
          const url = await uploadToSupabase(file);
          const tipo = isVideoFile(file) ? 'video_file' : isImageFile(file) ? 'imagen' : 'imagen';
          await supabase.from('media_content').insert({
            tipo,
            url,
            nombre_sponsor: nombreSponsor || null,
            nombre: file.name,
          });
        }
        await fetchMedia();
      } catch (e: any) {
        setError(e?.message || 'Error al subir');
      } finally {
        setUploading(false);
      }
    },
    [supabase, nombreSponsor, fetchMedia]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.ogg', '.m4v'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    disabled: !supabase || uploading,
    multiple: true,
  });

  const addVideoUrl = async () => {
    if (!supabase || !urlVideo.trim()) return;
    setError(null);
    try {
      await supabase.from('media_content').insert({
        tipo: 'video_url',
        url: urlVideo.trim(),
        nombre_sponsor: nombreSponsor || null,
        nombre: nombreSponsor || 'Video URL',
      });
      setUrlVideo('');
      await fetchMedia();
    } catch (e: any) {
      setError(e?.message || 'Error al agregar URL');
    }
  };

  const deleteMedia = async (id: string) => {
    if (!supabase) return;
    try {
      await supabase.from('media_content').delete().eq('id', id);
      await fetchMedia();
    } catch (e: any) {
      setError(e?.message || 'Error al eliminar');
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

  const setPantallaContenido = async (pantallaId: string, mediaContentId: string | null) => {
    if (!supabase) return;
    try {
      await supabase.from('display_estado').upsert(
        { pantalla_id: pantallaId, media_content_id: mediaContentId },
        { onConflict: 'pantalla_id' }
      );
      setDisplayEstado((prev) => ({ ...prev, [pantallaId]: mediaContentId }));
    } catch (e: any) {
      setError(e?.message || 'Error al asignar');
    }
  };

  const sincronizarTodo = async () => {
    if (!supabase) return;
    setSyncing(true);
    setError(null);
    try {
      for (const p of pantallas) {
        const id = displayEstado[p.id] ?? null;
        await supabase.from('display_estado').upsert(
          { pantalla_id: p.id, media_content_id: id },
          { onConflict: 'pantalla_id' }
        );
      }
      await fetchDisplayEstado();
    } catch (e: any) {
      setError(e?.message || 'Error al sincronizar');
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-emerald-400">Smart Pádel - Media Center</h1>
          <div className="flex gap-4">
            <a
              href="/admin"
              className="bg-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition"
            >
              ← Admin
            </a>
            <button
              type="button"
              onClick={() => document.getElementById('biblioteca-medios')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-emerald-500 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Contenido
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA 1 y 2: CARGA Y LISTADO */}
          <div className="lg:col-span-2 space-y-6">
            <section id="biblioteca-medios" className="bg-slate-800 p-6 rounded-2xl border border-slate-700 scroll-mt-4">
              <h2 className="text-xl font-semibold mb-4">Biblioteca de Medios</h2>

              <div className="mb-4 flex flex-wrap gap-2">
                <input
                  type="url"
                  placeholder="URL YouTube / Vimeo"
                  value={urlVideo}
                  onChange={(e) => setUrlVideo(e.target.value)}
                  className="flex-1 min-w-[200px] bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Sponsor (opcional)"
                  value={nombreSponsor}
                  onChange={(e) => setNombreSponsor(e.target.value)}
                  className="w-40 bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={addVideoUrl}
                  disabled={!urlVideo.trim()}
                  className="bg-emerald-500 px-4 py-2.5 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <LinkIcon className="w-4 h-4" />
                  Añadir URL
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {/* Primera celda: dropzone "Arrastrar video o imagen" */}
                <div
                  {...getRootProps()}
                  className={`aspect-video rounded-lg flex flex-col items-center justify-center border-2 border-dashed transition cursor-pointer ${isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-500 hover:border-emerald-400 bg-slate-700/50'
                    } ${uploading ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-2" />
                  ) : (
                    <p className="text-slate-400 text-sm">Arrastrar video o imagen</p>
                  )}
                </div>
                {/* Items cargados */}
                {mediaList.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-600 aspect-video bg-slate-700"
                  >
                    {item.tipo === 'imagen' || item.tipo === 'video_file' ? (
                      item.url.match(/\.(mp4|webm|mov|m4v)/i) ? (
                        <video
                          src={item.url}
                          className="object-cover w-full h-full"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.nombre_sponsor || 'Media'}
                          className="object-cover w-full h-full"
                        />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <LinkIcon className="w-8 h-8 text-emerald-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition">
                      <p className="text-xs font-bold truncate">
                        {item.tipo === 'video_url' ? 'Video' : item.tipo === 'video_file' ? 'Video' : 'Imagen'}: {item.nombre_sponsor || item.nombre || 'Sin nombre'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteMedia(item.id); }}
                        className="text-[10px] text-red-400 underline text-left mt-0.5"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-4">Tira Informativa (Marquee)</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Escribe el mensaje que recorrerá las pantallas..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMensajeTira()}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  onClick={addMensajeTira}
                  disabled={!nuevoMensaje.trim()}
                  className="bg-emerald-500 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  Añadir
                </button>
              </div>
              <ul className="space-y-2">
                {tiraList.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded-lg border border-slate-700"
                  >
                    <span className="text-sm truncate">{t.mensaje}</span>
                    <button
                      onClick={() => deleteTira(t.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* COLUMNA 3: CONTROL DE PANTALLAS */}
          <div className="space-y-6">
            <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-orange-400 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Estado de Pantallas
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {pantallasWithMedia.length === 0 ? (
                  <p className="text-slate-500 text-sm col-span-full">No hay pantallas registradas. Añádelas en Supabase (tabla pantallas).</p>
                ) : (
                  pantallasWithMedia.map((pantalla) => (
                    <div key={pantalla.id} className="bg-slate-800 rounded-xl p-2 border border-slate-700">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden relative mb-2">
                        {pantalla.media_contents?.url && pantalla.media_contents.tipo === 'imagen' ? (
                          <Image
                            src={pantalla.media_contents.url}
                            alt="Publicidad Sponsor"
                            width={1920}
                            height={1080}
                            priority
                            className="object-cover w-full h-full opacity-50"
                          />
                        ) : pantalla.media_contents?.url ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                            <Video className="w-8 h-8 text-slate-500" />
                          </div>
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold bg-black/50 px-2 py-1 rounded">
                            {pantalla.media_contents?.nombre_sponsor || 'Sin contenido'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1 gap-2">
                        <span className="text-xs font-bold truncate min-w-0">{pantalla.nombre}</span>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${pantalla.isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      </div>
                      <select
                        className="mt-2 w-full bg-slate-900 text-[10px] border border-slate-600 p-1.5 rounded"
                        value={displayEstado[pantalla.id] ?? ''}
                        onChange={(e) => void setPantallaContenido(pantalla.id, e.target.value || null)}
                      >
                        <option value="">Mantenimiento</option>
                        {mediaList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre_sponsor || m.nombre || m.tipo}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))
                )}
              </div>
            </section>

            <button
              onClick={sincronizarTodo}
              disabled={!pantallas.length || syncing}
              className="w-full bg-orange-500 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 shadow-lg shadow-orange-900/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {syncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
              SINCRONIZAR TODO ⚡
            </button>

            <p className="text-slate-500 text-xs">
              Las pantallas en <strong>/display/[id]</strong> se actualizan en tiempo real al cambiar el contenido.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
