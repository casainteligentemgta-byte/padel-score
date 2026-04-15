'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import CourtCard from '@/components/publicidad/CourtCard';
import type { CourtPlaylistRow } from '@/components/publicidad/CourtCard';
import {
  normalizeCanchaIdKey,
  partitionPlaylistRows,
  playlistRowKind,
  upsertCanchaPlaylistConfig,
  type CourtPlaylistRowDb,
} from '@/lib/courtPlaylists';
import { buildVenuesAndCourtsFromTournaments, type VenueWithCourts } from '@/lib/venuesFromTournaments';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FolderOpen,
  Layout,
  Link2,
  Loader2,
  Monitor,
  Share2,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
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
import { driveDossierUrls, parseGoogleDriveFolderId } from '@/lib/driveDossier';

const mb = (bytes?: number | null) => {
  if (!bytes || Number(bytes) <= 0) return '—';
  return `${(Number(bytes) / (1024 * 1024)).toFixed(1)} MB`;
};

/** `fetchAssignmentsAction` filtra sede con ilike en servidor; el listado por cancha debe alinear el criterio (mayúsculas/espacios). */
function adminPublicidadVenueMatches(rowVenue: string | null | undefined, selectedVenue: string | null | undefined): boolean {
  return String(rowVenue || '').trim().toLowerCase() === String(selectedVenue || '').trim().toLowerCase();
}

function adminPublicidadCanchaMatches(rowCancha: string | null | undefined, courtKey: string | null | undefined): boolean {
  return normalizeCanchaIdKey(rowCancha) === normalizeCanchaIdKey(courtKey);
}

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
  /** Partido asignado en `pizarra_cancha_state` por cancha (misma fuente que la pizarra en TV). */
  const [previewMatchByCourt, setPreviewMatchByCourt] = useState<
    Record<string, { tournamentId: string; matchId: string } | null>
  >({});

  /** Dossier Google Drive (admin_settings.publicidad_dossier_drive_id) */
  const [dossierDraft, setDossierDraft] = useState('');
  const [dossierFolderId, setDossierFolderId] = useState<string | null>(null);
  const [savingDossier, setSavingDossier] = useState(false);
  const [dossierCopied, setDossierCopied] = useState(false);

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
    const want = String(selectedVenue || '').trim().toLowerCase();
    if (!want) return [];
    return venues.find((v) => v.name.trim().toLowerCase() === want)?.courts ?? [];
  }, [venues, selectedVenue]);

  const selectedVenueMonitorHref = useMemo(() => {
    const want = String(selectedVenue || '').trim().toLowerCase();
    if (!want) return null;
    const tid = venues.find((v) => v.name.trim().toLowerCase() === want)?.tournamentId?.trim();
    return tid ? `/tournaments/${tid}/monitor` : null;
  }, [venues, selectedVenue]);

  const courtKeySet = useMemo(() => new Set(selectedVenueCourts.map((c) => c.key)), [selectedVenueCourts]);

  const fetchAssignments = useCallback(async () => {
    if (!selectedVenue) return;
    const keys = selectedVenueCourts.map((c) => String(c.key).trim());
    try {
      const res = await fetchAssignmentsAction(selectedVenue);
      if (!res.ok) {
        console.error('fetchAssignmentsAction:', res.error);
        return;
      }
      const { assignments: data, config, tiras } = res;

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
          imagen_pausa_entre_segundos: Math.max(0, Math.floor(Number(r.imagen_pausa_entre_segundos) || 0)),
          video_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.video_cambio_cada_minutos) || 0)),
          imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.imagen_cambio_cada_minutos) || 0)),
          tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(r.tira_cambio_cada_minutos) || 0)),
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
        await Promise.all([
          fetchMedia(),
          fetchTicker(),
          loadVenuesAndCourts(),
          (async () => {
            const s = await dataService.getAdminSettings();
            if (!mounted) return;
            const id = s?.publicidadDossierDriveId?.trim() || null;
            if (id) {
              setDossierFolderId(id);
              setDossierDraft(id);
            }
          })(),
        ]);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'No se pudo cargar publicidad.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [fetchMedia, fetchTicker, loadVenuesAndCourts]);


  useEffect(() => {
    const keys = selectedVenueCourts.map((c) => String(c.key).trim());
    if (keys.length === 0) {
      setCanchasHealth({});
      return;
    }
    const load = async () => {
      const dbKeys = Array.from(
        new Set(
          keys.flatMap((k) => (k.toLowerCase().startsWith('cancha_') ? [k] : [k, `cancha_${k}`])),
        ),
      );
      const venueRow = String(selectedVenue || '').trim();
      const { data, error } = await supabase
        .from('canchas')
        .select('cancha_id, last_seen')
        .eq('venue_name', venueRow)
        .in('cancha_id', dbKeys);
      if (error) return;
      const keySet = new Set(keys);
      const m: Record<string, string | null> = {};
      keys.forEach((k) => {
        m[k] = null;
      });
      (data || []).forEach((r: { cancha_id: string; last_seen: string | null }) => {
        const nk = normalizeCanchaIdKey(r.cancha_id);
        if (keySet.has(nk)) {
          m[nk] = r.last_seen;
        }
      });
      setCanchasHealth(m);
    };
    void load();
    const id = window.setInterval(load, 15_000);
    return () => window.clearInterval(id);
  }, [selectedVenue, selectedVenueCourts, supabase]);

  useEffect(() => {
    fetchAssignments();
  }, [selectedVenue, selectedVenueCourts, fetchAssignments]);

  useEffect(() => {
    const courts = selectedVenueCourts;
    if (courts.length === 0) {
      setPreviewMatchByCourt({});
      return;
    }
    let cancelled = false;
    const tick = async () => {
      const next: Record<string, { tournamentId: string; matchId: string } | null> = {};
      await Promise.all(
        courts.map(async (court) => {
          const canchaId = `cancha_${court.displayNum}`;
          try {
            const row = await dataService.getPizarraCanchaState(canchaId);
            const d = row?.data || {};
            const mid = String(d.partido_id || d.active_match_id || '').trim();
            const tid = String(d.torneo_id || '').trim();
            if (!mid || mid.startsWith('live_')) {
              next[court.key] = null;
              return;
            }
            next[court.key] = { tournamentId: tid, matchId: mid };
          } catch {
            next[court.key] = null;
          }
        }),
      );
      if (!cancelled) setPreviewMatchByCourt(next);
    };
    void tick();
    const id = window.setInterval(tick, 8000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [selectedVenueCourts]);

  const videos = useMemo(() => mediaList.filter((m) => String(m.tipo).includes('video')), [mediaList]);
  const carrusel = useMemo(() => mediaList.filter((m) => m.tipo === 'imagen'), [mediaList]);



  const saveVideoPlaylistForCourt = async (courtKey: string, orderedMediaIds: string[], cambioMin: number) => {
    if (!selectedVenue) return;
    setSavingCourtKey(courtKey);
    setError(null);
    try {
      const durSec = cambioMin > 0 ? cambioMin * 60 : 30;
      const s1 = await savePlaylistAction(courtKey, selectedVenue, orderedMediaIds, 'video', durSec);
      if (!s1.ok) {
        setError(s1.error);
        return;
      }
      const s2 = await upsertPlaylistConfigAction(selectedVenue, courtKey, {
        video_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
      });
      if (!s2.ok) {
        setError(s2.error);
        return;
      }
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
      const s1 = await savePlaylistAction(courtKey, selectedVenue, orderedMediaIds, 'imagen', durSec);
      if (!s1.ok) {
        setError(s1.error);
        return;
      }
      const s2 = await upsertPlaylistConfigAction(selectedVenue, courtKey, {
        imagen_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
        imagen_loop: loop,
        imagen_pausa_entre_segundos: Math.max(0, Math.floor(Number(pausaSeg) || 0)),
      });
      if (!s2.ok) {
        setError(s2.error);
        return;
      }
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
      const s1 = await saveTiraPlaylistAction(courtKey, selectedVenue, orderedTiraIds);
      if (!s1.ok) {
        setError(s1.error);
        return;
      }
      const s2 = await upsertPlaylistConfigAction(selectedVenue, courtKey, {
        tira_cambio_cada_minutos: Math.max(0, Math.floor(Number(cambioMin) || 0)),
      });
      if (!s2.ok) {
        setError(s2.error);
        return;
      }
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
        const addRes = await addMediaContentAction({
          tipo,
          url: pub.publicUrl,
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
      const r = await deleteMediaAction(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
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
      const r = await renameMediaAction(id, nextName);
      if (!r.ok) {
        setError(r.error);
        return;
      }
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
      const r = await addTickerAction(msg, tiraList.length);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setNuevoTicker('');
      await fetchTicker();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const saveDossier = async () => {
    const parsed = parseGoogleDriveFolderId(dossierDraft);
    if (!parsed) {
      setError('Introduce un ID de carpeta de Google Drive válido o una URL que contenga /folders/…');
      return;
    }
    setSavingDossier(true);
    setError(null);
    try {
      await dataService.setAdminSettings({ publicidadDossierDriveId: parsed });
      setDossierFolderId(parsed);
      setDossierDraft(parsed);
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el dossier.');
    } finally {
      setSavingDossier(false);
    }
  };

  const dossierOpenUrl = dossierFolderId ? driveDossierUrls(dossierFolderId).open : null;
  const dossierEmbedUrl = dossierFolderId ? driveDossierUrls(dossierFolderId).embed : null;

  const copyDossierLink = async () => {
    if (!dossierOpenUrl) return;
    try {
      await navigator.clipboard.writeText(dossierOpenUrl);
      setDossierCopied(true);
      window.setTimeout(() => setDossierCopied(false), 2000);
    } catch {
      setError('No se pudo copiar al portapapeles.');
    }
  };

  const shareDossier = async () => {
    if (!dossierOpenUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Dossier de publicidad — Smart Padel',
          text: 'Enlace al dossier de publicidad en Google Drive:',
          url: dossierOpenUrl,
        });
      } else {
        await copyDossierLink();
      }
    } catch (e: any) {
      if (String(e?.name || '') !== 'AbortError') {
        await copyDossierLink();
      }
    }
  };

  const deleteTicker = async (id: string) => {
    try {
      const r = await deleteTickerAction(id);
      if (!r.ok) {
        setError(r.error);
        return;
      }
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
              className="inline-flex items-center justify-center gap-2 pl-2 pr-3 py-2.5 rounded-xl transition-colors border border-white/10 bg-black/30 hover:bg-white/10 hover:border-white/20 group"
              aria-label="Volver atrás"
              title="Volver atrás"
            >
              <ArrowLeft className="w-5 h-5 shrink-0 text-white/80 group-hover:text-padel-primary transition-colors" strokeWidth={2.25} />
            </button>
          </div>

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-black uppercase italic leading-none">Admin Publicidad</h1>
              <p className="text-[11px] text-white/60 uppercase tracking-wider leading-tight">Playlist independiente por sede y cancha</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/publicidad/manual"
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-[#ccff00]/25 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#ccff00]/10 hover:border-[#ccff00]/45 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-black/20"
              >
                <BookOpen className="w-4 h-4 text-padel-primary" />
                Manual de ventas
              </Link>
              <button
                type="button"
                onClick={() => router.push('/admin/display/templates')}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-white/10 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/20"
              >
                <Layout className="w-4 h-4 text-padel-primary" />
                Dynamic Studio
              </button>
            </div>
          </header>

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <section className="rounded-2xl border border-padel-primary/35 bg-gradient-to-br from-padel-primary/[0.07] to-black/40 p-4 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-padel-primary/40 bg-black/50">
                  <FolderOpen className="h-5 w-5 text-padel-primary" />
                </div>
                <div className="min-w-0 space-y-1">
                  <h2 className="text-lg font-black uppercase italic tracking-tight text-white">Dossier de publicidad</h2>
                  <p className="text-[11px] text-white/60 uppercase tracking-wider leading-snug">
                    Carpeta en Google Drive — guarda el ID o pega el enlace; visualiza y comparte desde aquí (solo administrador).
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!dossierOpenUrl}
                  onClick={() => dossierOpenUrl && window.open(dossierOpenUrl, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10 disabled:opacity-40"
                >
                  <ExternalLink className="h-4 w-4 text-padel-primary" />
                  Abrir en Drive
                </button>
                <button
                  type="button"
                  disabled={!dossierOpenUrl}
                  onClick={() => void copyDossierLink()}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/10 disabled:opacity-40"
                >
                  <Copy className="h-4 w-4 text-padel-primary" />
                  {dossierCopied ? 'Copiado' : 'Copiar enlace'}
                </button>
                <button
                  type="button"
                  disabled={!dossierOpenUrl}
                  onClick={() => void shareDossier()}
                  className="inline-flex items-center gap-2 rounded-xl border border-padel-primary/50 bg-padel-primary/15 px-3 py-2 text-xs font-black uppercase tracking-wide text-padel-primary hover:bg-padel-primary/25 disabled:opacity-40"
                >
                  <Share2 className="h-4 w-4" />
                  Enviar / compartir
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">ID o URL de la carpeta</label>
                <input
                  type="text"
                  value={dossierDraft}
                  onChange={(e) => setDossierDraft(e.target.value)}
                  placeholder="1gVX… o https://drive.google.com/drive/folders/…"
                  className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2.5 text-sm text-white outline-none focus:border-padel-primary/60"
                />
              </div>
              <button
                type="button"
                disabled={savingDossier}
                onClick={() => void saveDossier()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-padel-primary px-5 py-2.5 text-sm font-black uppercase text-black hover:brightness-105 disabled:opacity-50"
              >
                {savingDossier ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
                Guardar dossier
              </button>
            </div>

            {dossierEmbedUrl && (
              <div className="mt-5 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/45">Vista previa embebida</p>
                <p className="text-[10px] text-white/40">
                  Si la carpeta no es pública o Drive bloquea el iframe, usa «Abrir en Drive».
                </p>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/60">
                  <iframe
                    title="Dossier Google Drive"
                    src={dossierEmbedUrl}
                    className="h-[min(70vh,520px)] w-full bg-black"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  />
                </div>
              </div>
            )}
          </section>

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
            <div className="flex flex-wrap items-end gap-2 max-w-xl">
              <div className="min-w-0 flex-1 max-w-md">
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
              {selectedVenue &&
                (selectedVenueMonitorHref ? (
                  <Link
                    href={selectedVenueMonitorHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Monitor de canchas / monitoreo de pantallas"
                    className="inline-flex h-[42px] shrink-0 items-center justify-center gap-2 rounded-xl border border-padel-primary/40 bg-padel-primary/15 px-3 text-padel-primary transition hover:bg-padel-primary/25"
                    aria-label="Abrir monitor de canchas"
                  >
                    <Monitor className="h-5 w-5" />
                    <span className="hidden font-black text-[10px] uppercase tracking-wider sm:inline">Monitor</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    title="Ningún torneo asociado a esta sede para abrir el monitor"
                    className="inline-flex h-[42px] shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 text-white/30"
                    aria-label="Monitor no disponible"
                  >
                    <Monitor className="h-5 w-5" />
                  </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {selectedVenueCourts.map((court) => {
                const rows = assignments.filter(
                  (a: CourtPlaylistRow) =>
                    adminPublicidadCanchaMatches(a.cancha_id, court.key) &&
                    adminPublicidadVenueMatches(a.venue_name, selectedVenue),
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
                    linkTournamentId={previewMatchByCourt[court.key]?.tournamentId ?? null}
                    linkMatchId={previewMatchByCourt[court.key]?.matchId ?? null}
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
