'use client';

import type { MediaContent } from '@/lib/supabase/publicidad';
import { healthStatusFromLastSeen, type CourtHealthStatus } from '@/lib/courtHealth';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Video,
  Wifi,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const SEDE_INDEX: Record<string, number> = {
  'El Bodeguero': 1,
  Elite: 2,
  'Food Kart': 3,
  'Margarita Padel': 4,
  'Playa el Agua': 5,
  'Sun Sol Costa Azul': 6,
  'Sun Sol Pedro Gonzalez': 7,
  Tibisay: 8,
};

function sedeIndexFromVenueName(venueName: string): number | null {
  const v = venueName.trim().toLowerCase();
  const matchKey = Object.keys(SEDE_INDEX).find((k) => k.toLowerCase() === v);
  return matchKey ? SEDE_INDEX[matchKey] : null;
}

function buildPizarraShortPath(sedeIndex: number, courtNum: number): string {
  return `s${sedeIndex}/c${courtNum}`;
}

export type CourtPlaylistRow = {
  id: string;
  cancha_id: string;
  orden: number;
  duracion_segundos: number;
  playlist_slot?: string | null;
  venue_name?: string | null;
  media_content?: MediaContent | null;
};

type CourtCardProps = {
  venueName: string;
  courtKey: string;
  displayCourtNum: number;
  title: string;
  libraryVideos: MediaContent[];
  libraryImages: MediaContent[];
  videoRows: CourtPlaylistRow[];
  imageRows: CourtPlaylistRow[];
  tiraList: { id: string; mensaje: string }[];
  linkedTiraIds: string[];
  videoCambioMinutos: number;
  imagenCambioMinutos: number;
  tiraCambioMinutos: number;
  imagenLoop: boolean;
  imagenPausaSeg: number;
  onSaveVideoPlaylist: (orderedMediaIds: string[], cambioMin: number) => void | Promise<void>;
  onSaveImagePlaylist: (
    orderedMediaIds: string[],
    cambioMin: number,
    loop: boolean,
    pausaSeg: number,
  ) => void | Promise<void>;
  onSaveTiraPlaylist: (orderedTiraIds: string[], cambioMin: number) => void | Promise<void>;
  lastSeenIso?: string | null;
  isSaving?: boolean;
};

function statusStyle(status: CourtHealthStatus): { wifi: string } {
  switch (status) {
    case 'online':
      return { wifi: 'text-emerald-400' };
    case 'warning':
      return { wifi: 'text-orange-400' };
    case 'offline':
      return { wifi: 'text-red-500' };
    default:
      return { wifi: 'text-white/30' };
  }
}

function orderedMediaIdsFromRows(rows: CourtPlaylistRow[]): string[] {
  return [...rows]
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
    .map((r) => r.media_content?.id)
    .filter((id): id is string => Boolean(id));
}

export default function CourtCard({
  venueName,
  courtKey,
  displayCourtNum,
  title,
  libraryVideos,
  libraryImages,
  videoRows,
  imageRows,
  tiraList,
  linkedTiraIds,
  videoCambioMinutos,
  imagenCambioMinutos,
  tiraCambioMinutos,
  imagenLoop,
  imagenPausaSeg,
  onSaveVideoPlaylist,
  onSaveImagePlaylist,
  onSaveTiraPlaylist,
  lastSeenIso,
  isSaving,
}: CourtCardProps) {
  const status = healthStatusFromLastSeen(lastSeenIso ?? null);
  const { wifi } = statusStyle(status);

  const [openPanel, setOpenPanel] = useState<'video' | 'imagen' | 'texto' | null>(null);
  const [minimalMode, setMinimalMode] = useState(false);

  const [videoSearch, setVideoSearch] = useState('');
  const [imageSearch, setImageSearch] = useState('');
  const [tiraSearch, setTiraSearch] = useState('');

  const [draftVideoIds, setDraftVideoIds] = useState<string[]>([]);
  const [draftVideoMin, setDraftVideoMin] = useState(0);
  const [draftImageIds, setDraftImageIds] = useState<string[]>([]);
  const [draftImageMin, setDraftImageMin] = useState(0);
  const [draftImagenLoop, setDraftImagenLoop] = useState(true);
  const [draftImagenPausa, setDraftImagenPausa] = useState(0);
  const [draftTiraIds, setDraftTiraIds] = useState<string[]>([]);
  const [draftTiraMin, setDraftTiraMin] = useState(0);

  const prevPanel = useRef<typeof openPanel | undefined>(undefined);
  useEffect(() => {
    const panelChanged = prevPanel.current !== openPanel;
    prevPanel.current = openPanel;

    if (openPanel === 'video') {
      const serverIds = orderedMediaIdsFromRows(videoRows);
      // Only force sync if the panel just opened OR the data actually changed from server
      setDraftVideoIds(serverIds);
      setDraftVideoMin(videoCambioMinutos);
      if (panelChanged) setVideoSearch('');
    } else if (openPanel === 'imagen') {
      const serverIds = orderedMediaIdsFromRows(imageRows);
      setDraftImageIds(serverIds);
      setDraftImageMin(imagenCambioMinutos);
      setDraftImagenLoop(imagenLoop);
      setDraftImagenPausa(imagenPausaSeg);
      if (panelChanged) setImageSearch('');
    } else if (openPanel === 'texto') {
      setDraftTiraIds([...linkedTiraIds]);
      setDraftTiraMin(tiraCambioMinutos);
      if (panelChanged) setTiraSearch('');
    }
  }, [
    openPanel,
    videoRows,
    videoCambioMinutos,
    imageRows,
    imagenCambioMinutos,
    imagenLoop,
    imagenPausaSeg,
    linkedTiraIds,
    tiraCambioMinutos,
  ]);

  const toggleVideo = () => setOpenPanel((p) => (p === 'video' ? null : 'video'));
  const toggleImagen = () => setOpenPanel((p) => (p === 'imagen' ? null : 'imagen'));
  const toggleTexto = () => setOpenPanel((p) => (p === 'texto' ? null : 'texto'));

  const sedeIndex = sedeIndexFromVenueName(venueName);
  const pizarraShortPath = sedeIndex ? buildPizarraShortPath(sedeIndex, displayCourtNum) : null;

  const directDisplayUrl = venueName.trim().length > 0
    ? `/display/court/${displayCourtNum}?complex=${encodeURIComponent(venueName)}${minimalMode ? '&minimal=1' : ''}`
    : `/display/court/${displayCourtNum}${minimalMode ? '?minimal=1' : ''}`;
  const previewSrc = directDisplayUrl;
  const shortHref = pizarraShortPath ? `/${pizarraShortPath}${minimalMode ? '?minimal=1' : ''}` : null;

  const videoById = (id: string) => libraryVideos.find((m) => m.id === id);
  const imageById = (id: string) => libraryImages.find((m) => m.id === id);

  const filteredVideos = libraryVideos.filter((m) => {
    const q = videoSearch.trim().toLowerCase();
    if (!q) return true;
    const n = (m.nombre_sponsor || m.nombre || '').toLowerCase();
    return n.includes(q);
  });

  const filteredImages = libraryImages.filter((m) => {
    const q = imageSearch.trim().toLowerCase();
    if (!q) return true;
    const n = (m.nombre_sponsor || m.nombre || '').toLowerCase();
    return n.includes(q);
  });

  const filteredTiras = tiraList.filter((t) => {
    const q = tiraSearch.trim().toLowerCase();
    if (!q) return true;
    return t.mensaje.toLowerCase().includes(q);
  });

  return (
    <div className="rounded-2xl border border-white/20 bg-gradient-to-b from-white/[0.06] to-black/35 p-3 flex flex-col min-h-0 shadow-[0_10px_30px_rgba(0,0,0,0.35)] ring-1 ring-white/5">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Wifi className={`w-4 h-4 shrink-0 ${wifi}`} aria-hidden />
          <h3 className="text-sm font-black uppercase leading-tight text-white/95 truncate">{title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-[10px] text-white/40 font-mono">{courtKey}</span>
        </div>
      </div>

      <div className="relative h-40 overflow-hidden rounded-xl border border-white/10 bg-black shrink-0">
        <iframe
          src={previewSrc}
          className="absolute top-0 left-0 border-0 pointer-events-none"
          style={{
            transform: 'scale(0.22)',
            transformOrigin: 'top left',
            width: '450%',
            height: '450%',
          }}
          title={`preview-${courtKey}`}
        />
      </div>
      {shortHref && (
        <a
          href={shortHref}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block text-center text-[9px] font-black uppercase tracking-widest text-white/45 hover:text-white/70 underline-offset-2 hover:underline truncate px-1"
          title="Abrir URL corta de pizarra"
        >
          smartpadel58.com/{pizarraShortPath}
        </a>
      )}

      <div className="mt-3 flex-1 min-h-0 flex flex-col">
        <p className="text-[9px] font-black uppercase text-white/45 tracking-wider mb-2">Playlist en pantalla</p>
        <div className="grid grid-cols-3 gap-1.5 shrink-0 mb-2">
          <button
            type="button"
            onClick={toggleVideo}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1 text-[9px] font-black uppercase tracking-tight transition-colors ${
              openPanel === 'video'
                ? 'border-padel-primary/55 bg-padel-primary/15 text-padel-primary'
                : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            Video
          </button>
          <button
            type="button"
            onClick={toggleImagen}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1 text-[9px] font-black uppercase tracking-tight transition-colors ${
              openPanel === 'imagen'
                ? 'border-padel-primary/55 bg-padel-primary/15 text-padel-primary'
                : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4 shrink-0" />
            Imagen
          </button>
          <button
            type="button"
            onClick={toggleTexto}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border py-2.5 px-1 text-[9px] font-black uppercase tracking-tight transition-colors ${
              openPanel === 'texto'
                ? 'border-padel-primary/55 bg-padel-primary/15 text-padel-primary'
                : 'border-white/10 bg-black/40 text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            Texto
          </button>
        </div>
        <button
          type="button"
          onClick={() => setMinimalMode((v) => !v)}
          className={`w-full mb-2 rounded-lg border px-2 py-2 text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
            minimalMode
              ? 'bg-padel-primary/15 border-padel-primary/40 text-padel-primary'
              : 'bg-black/40 border-white/10 text-white/70 hover:bg-white/5'
          }`}
          title={minimalMode ? 'Mostrar publicidad/tiras' : 'Solo pizarra (sin video/imagen/tira)'}
        >
          {minimalMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {minimalMode ? 'Solo pizarra' : 'Con publicidad'}
        </button>

        {/* RESUMEN DE PLAYLIST ACTUAL (VISIBLE SIEMPRE) */}
        {!openPanel && (
          <div className="mt-1 space-y-2">
            {videoRows.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                <p className="text-[8px] font-black uppercase text-white/40 mb-1 flex items-center gap-1">
                  <Video size={10} className="text-padel-primary" /> Playlist Videos
                </p>
                <div className="flex flex-wrap gap-1">
                  {videoRows.map((r, i) => (
                    <span
                      key={r.id}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80"
                    >
                      {i + 1}. {r.media_content?.nombre_sponsor || r.media_content?.nombre || 'Clip'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {imageRows.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                <p className="text-[8px] font-black uppercase text-white/40 mb-1 flex items-center gap-1">
                  <ImageIcon size={10} className="text-padel-primary" /> Carrusel Imágenes
                </p>
                <div className="flex flex-wrap gap-1">
                  {imageRows.map((r, i) => (
                    <span
                      key={r.id}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/80"
                    >
                      {i + 1}. {r.media_content?.nombre_sponsor || r.media_content?.nombre || 'Imagen'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {videoRows.length === 0 && imageRows.length === 0 && !minimalMode && (
              <p className="text-center py-2 text-[9px] text-white/30 italic">Sin contenido asignado</p>
            )}
          </div>
        )}

        {openPanel && (
          <div className="overflow-y-auto max-h-[520px] rounded-xl border border-white/10 bg-black/25 p-2 space-y-2">
            {openPanel === 'video' && (
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-2 space-y-2">
                  <p className="text-[9px] font-black uppercase text-white/50">Biblioteca de videos</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35" />
                    <input
                      value={videoSearch}
                      onChange={(e) => setVideoSearch(e.target.value)}
                      placeholder="Buscar…"
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/25"
                    />
                  </div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1">
                    {filteredVideos.map((m) => {
                      const inList = draftVideoIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5"
                        >
                          <span className="text-[10px] text-white/85 truncate">
                            {m.nombre_sponsor || m.nombre || m.id}
                          </span>
                          {inList ? (
                            <button
                              type="button"
                              onClick={() => setDraftVideoIds((prev) => prev.filter((x) => x !== m.id))}
                              className="shrink-0 text-[8px] font-black uppercase text-red-300 px-2 py-0.5 rounded bg-red-500/15 border border-red-500/25"
                            >
                              Quitar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDraftVideoIds((prev) => [...prev, m.id])}
                              className="shrink-0 flex items-center gap-0.5 text-[8px] font-black uppercase text-padel-primary px-2 py-0.5 rounded bg-padel-primary/10 border border-padel-primary/30"
                            >
                              <Plus className="w-3 h-3" /> Añadir
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {filteredVideos.length === 0 && (
                      <p className="text-[9px] text-white/40 py-2 text-center">Sin resultados</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-padel-primary/25 bg-black/35 p-2 space-y-2">
                  <p className="text-[9px] font-black uppercase text-padel-primary/90">Orden de reproducción</p>
                  <p className="text-[8px] text-white/45 leading-snug">
                    El orden es el de la lista (arriba → abajo). Usa flechas para mover.
                  </p>
                  <div className="max-h-[120px] overflow-y-auto space-y-1">
                    {draftVideoIds.length === 0 ? (
                      <p className="text-[9px] text-white/40 text-center py-3">Añade clips desde la biblioteca</p>
                    ) : (
                      draftVideoIds.map((id, idx) => {
                        const m = videoById(id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-1.5 py-1"
                          >
                            <span className="text-[9px] font-black text-white/45 w-4">{idx + 1}</span>
                            <span className="text-[10px] text-white/90 flex-1 truncate">
                              {m?.nombre_sponsor || m?.nombre || id.slice(0, 8)}
                            </span>
                            <div className="flex flex-col">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() =>
                                  setDraftVideoIds((prev) => {
                                    const n = [...prev];
                                    [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
                                    return n;
                                  })
                                }
                                className="p-0.5 rounded border border-white/10 disabled:opacity-20"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={idx >= draftVideoIds.length - 1}
                                onClick={() =>
                                  setDraftVideoIds((prev) => {
                                    const n = [...prev];
                                    [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                                    return n;
                                  })
                                }
                                className="p-0.5 rounded border border-white/10 disabled:opacity-20"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDraftVideoIds((prev) => prev.filter((x) => x !== id))}
                              className="p-1 text-white/50 hover:text-red-300"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-2 space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer">
                    <input
                      type="radio"
                      name={`vm-${courtKey}`}
                      checked={draftVideoMin === 0}
                      onChange={() => setDraftVideoMin(0)}
                    />
                    Loop continuo (pasa al siguiente al terminar el clip)
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer flex-wrap">
                    <input
                      type="radio"
                      name={`vm-${courtKey}`}
                      checked={draftVideoMin > 0}
                      onChange={() => setDraftVideoMin(1)}
                    />
                    <span>Cada</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      disabled={draftVideoMin === 0}
                      value={draftVideoMin > 0 ? draftVideoMin : 1}
                      onChange={(e) => setDraftVideoMin(Math.max(1, Number(e.target.value) || 1))}
                      className="w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white [color-scheme:dark] disabled:opacity-40"
                    />
                    <span>min pasar al siguiente (aunque el clip siga)</span>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void onSaveVideoPlaylist(draftVideoIds, draftVideoMin)}
                  className="w-full rounded-lg bg-padel-primary text-black text-[9px] font-black uppercase py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Guardar videos
                </button>
              </div>
            )}

            {openPanel === 'imagen' && (
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-2 space-y-2">
                  <p className="text-[9px] font-black uppercase text-white/50">Biblioteca de imágenes</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35" />
                    <input
                      value={imageSearch}
                      onChange={(e) => setImageSearch(e.target.value)}
                      placeholder="Buscar…"
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/25"
                    />
                  </div>
                  <div className="max-h-[140px] overflow-y-auto space-y-1">
                    {filteredImages.map((m) => {
                      const inList = draftImageIds.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5"
                        >
                          <span className="text-[10px] text-white/85 truncate">
                            {m.nombre_sponsor || m.nombre || m.id}
                          </span>
                          {inList ? (
                            <button
                              type="button"
                              onClick={() => setDraftImageIds((prev) => prev.filter((x) => x !== m.id))}
                              className="shrink-0 text-[8px] font-black uppercase text-red-300 px-2 py-0.5 rounded bg-red-500/15"
                            >
                              Quitar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDraftImageIds((prev) => [...prev, m.id])}
                              className="shrink-0 flex items-center gap-0.5 text-[8px] font-black uppercase text-padel-primary px-2 py-0.5 rounded bg-padel-primary/10 border border-padel-primary/30"
                            >
                              <Plus className="w-3 h-3" /> Añadir
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {filteredImages.length === 0 && (
                      <p className="text-[9px] text-white/40 py-2 text-center">Sin resultados</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-padel-primary/25 bg-black/35 p-2 space-y-1">
                  <p className="text-[9px] font-black uppercase text-padel-primary/90">Orden en carrusel</p>
                  <div className="max-h-[100px] overflow-y-auto space-y-1">
                    {draftImageIds.length === 0 ? (
                      <p className="text-[9px] text-white/40 text-center py-2">Añade imágenes</p>
                    ) : (
                      draftImageIds.map((id, idx) => {
                        const m = imageById(id);
                        return (
                          <div
                            key={id}
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-black/30 px-1.5 py-1"
                          >
                            <span className="text-[9px] font-black text-white/45 w-4">{idx + 1}</span>
                            <span className="text-[10px] flex-1 truncate">
                              {m?.nombre_sponsor || m?.nombre || id.slice(0, 8)}
                            </span>
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() =>
                                setDraftImageIds((prev) => {
                                  const n = [...prev];
                                  [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
                                  return n;
                                })
                              }
                              className="p-0.5 disabled:opacity-20"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={idx >= draftImageIds.length - 1}
                              onClick={() =>
                                setDraftImageIds((prev) => {
                                  const n = [...prev];
                                  [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                                  return n;
                                })
                              }
                              className="p-0.5 disabled:opacity-20"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraftImageIds((prev) => prev.filter((x) => x !== id))}
                              className="p-1 text-white/50"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-2 space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer">
                    <input
                      type="radio"
                      name={`im-${courtKey}`}
                      checked={draftImageMin === 0}
                      onChange={() => setDraftImageMin(0)}
                    />
                    Loop continuo (duración por ítem en BD; ver abajo)
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer flex-wrap">
                    <input
                      type="radio"
                      name={`im-${courtKey}`}
                      checked={draftImageMin > 0}
                      onChange={() => setDraftImageMin(1)}
                    />
                    <span>Cada</span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      disabled={draftImageMin === 0}
                      value={draftImageMin > 0 ? draftImageMin : 1}
                      onChange={(e) => setDraftImageMin(Math.max(1, Number(e.target.value) || 1))}
                      className="w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] [color-scheme:dark] disabled:opacity-40"
                    />
                    <span>min por imagen</span>
                  </label>
                  <label className="flex items-center gap-2 text-[9px] text-white/70 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={draftImagenLoop}
                      onChange={(e) => setDraftImagenLoop(e.target.checked)}
                    />
                    Repetir carrusel al llegar al final
                  </label>
                  <div className="flex items-center gap-2 text-[9px] text-white/60">
                    <span>Pausa extra (s)</span>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={draftImagenPausa}
                      onChange={(e) => setDraftImagenPausa(Number(e.target.value) || 0)}
                      className="w-14 bg-black/50 border border-white/10 rounded px-1 py-0.5 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    void onSaveImagePlaylist(
                      draftImageIds,
                      draftImageMin,
                      draftImagenLoop,
                      draftImagenPausa,
                    )
                  }
                  className="w-full rounded-lg bg-padel-primary text-black text-[9px] font-black uppercase py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Guardar imágenes
                </button>
              </div>
            )}

            {openPanel === 'texto' && (
              <div className="grid grid-cols-1 gap-2">
                <div className="rounded-xl border border-white/10 bg-black/30 p-2 space-y-2">
                  <p className="text-[9px] font-black uppercase text-white/50">Mensajes disponibles</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35" />
                    <input
                      value={tiraSearch}
                      onChange={(e) => setTiraSearch(e.target.value)}
                      placeholder="Buscar…"
                      className="w-full bg-black/40 border border-white/10 rounded-lg pl-8 pr-2 py-1.5 text-[11px] text-white placeholder:text-white/35 outline-none focus:border-white/25"
                    />
                  </div>
                  <div className="max-h-[120px] overflow-y-auto space-y-1">
                    {filteredTiras.map((t) => {
                      const inList = draftTiraIds.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          className="flex items-start justify-between gap-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5"
                        >
                          <span className="text-[10px] text-white/85 leading-snug">{t.mensaje}</span>
                          {inList ? (
                            <button
                              type="button"
                              onClick={() => setDraftTiraIds((prev) => prev.filter((x) => x !== t.id))}
                              className="shrink-0 text-[8px] font-black uppercase text-red-300"
                            >
                              Quitar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDraftTiraIds((prev) => [...prev, t.id])}
                              className="shrink-0 text-[8px] font-black uppercase text-padel-primary"
                            >
                              + Añadir
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-padel-primary/25 bg-black/35 p-2 space-y-1">
                  <p className="text-[9px] font-black uppercase text-padel-primary/90">Orden en tira</p>
                  <div className="max-h-[100px] overflow-y-auto space-y-1">
                    {draftTiraIds.map((id, idx) => {
                      const t = tiraList.find((x) => x.id === id);
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-1 rounded-lg border border-white/10 px-1.5 py-1"
                        >
                          <span className="text-[9px] text-white/45 w-4">{idx + 1}</span>
                          <span className="text-[10px] flex-1 truncate">{t?.mensaje || id}</span>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() =>
                              setDraftTiraIds((prev) => {
                                const n = [...prev];
                                [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
                                return n;
                              })
                            }
                            className="p-0.5 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx >= draftTiraIds.length - 1}
                            onClick={() =>
                              setDraftTiraIds((prev) => {
                                const n = [...prev];
                                [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                                return n;
                              })
                            }
                            className="p-0.5 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftTiraIds((prev) => prev.filter((x) => x !== id))}
                            className="p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                    {draftTiraIds.length === 0 && (
                      <p className="text-[9px] text-white/40 text-center py-2">Añade mensajes</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-2 space-y-2">
                  <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer">
                    <input
                      type="radio"
                      name={`tr-${courtKey}`}
                      checked={draftTiraMin === 0}
                      onChange={() => setDraftTiraMin(0)}
                    />
                    Tira continua (marquee; la rotación por minutos la usará la pantalla cuando esté soportada)
                  </label>
                  <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer flex-wrap">
                    <input
                      type="radio"
                      name={`tr-${courtKey}`}
                      checked={draftTiraMin > 0}
                      onChange={() => setDraftTiraMin(2)}
                    />
                    <span>Destacar cada mensaje</span>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      disabled={draftTiraMin === 0}
                      value={draftTiraMin > 0 ? draftTiraMin : 2}
                      onChange={(e) => setDraftTiraMin(Math.max(1, Number(e.target.value) || 1))}
                      className="w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] [color-scheme:dark] disabled:opacity-40"
                    />
                    <span>min (config guardada; pantallas pueden leerla)</span>
                  </label>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => void onSaveTiraPlaylist(draftTiraIds, draftTiraMin)}
                  className="w-full rounded-lg bg-padel-primary text-black text-[9px] font-black uppercase py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Guardar tira
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
