'use client';

import CourtPlaylist from '@/components/publicidad/CourtPlaylist';
import type { MediaContent } from '@/lib/supabase/publicidad';
import { healthBadgeLabel, healthStatusFromLastSeen, type CourtHealthStatus } from '@/lib/courtHealth';
import { Plus, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

// Sedes ordenadas alfabéticamente (igual que en el generador) y mapeadas a su índice S1..S8.
// Esto permite construir la URL corta tipo: smartpadel58.com/s1/c1
const SEDE_INDEX: Record<string, number> = {
    'El Bodeguero': 1,
    'Elite': 2,
    'Food Kart': 3,
    'Margarita Padel': 4,
    'Playa el Agua': 5,
    'Sun Sol Costa Azul': 6,
    'Sun Sol Pedro Gonzalez': 7,
    'Tibisay': 8,
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
  media_content?: MediaContent | null;
};

type CourtCardProps = {
  venueName: string;
  courtKey: string;
  displayCourtNum: number;
  title: string;
  videoRows: CourtPlaylistRow[];
  imageRows: CourtPlaylistRow[];
  tiraList: { id: string; mensaje: string }[];
  linkedTiraIds: string[];
  imagenLoop: boolean;
  imagenPausaSeg: number;
  onAddClip: (slot: 'video' | 'imagen') => void;
  onRemoveRow: (id: string) => void;
  onToggleTira: (tiraId: string, selected: boolean) => void;
  onSaveImagenConfig: (loop: boolean, pausaSeg: number) => void;
  lastSeenIso?: string | null;
};

function statusStyle(status: CourtHealthStatus): { wifi: string; badge: string } {
  switch (status) {
    case 'online':
      return { wifi: 'text-emerald-400', badge: 'text-emerald-300 border-emerald-500/50 bg-emerald-500/15' };
    case 'warning':
      return { wifi: 'text-orange-400', badge: 'text-orange-300 border-orange-500/50 bg-orange-500/15' };
    case 'offline':
      return { wifi: 'text-red-500', badge: 'text-red-300 border-red-500/50 bg-red-500/15' };
    default:
      return { wifi: 'text-white/30', badge: 'text-white/30 border-white/20 bg-white/5' };
  }
}

export default function CourtCard({
  venueName,
  courtKey,
  displayCourtNum,
  title,
  videoRows,
  imageRows,
  tiraList,
  linkedTiraIds,
  imagenLoop,
  imagenPausaSeg,
  onAddClip,
  onRemoveRow,
  onToggleTira,
  onSaveImagenConfig,
  lastSeenIso,
}: CourtCardProps) {
  const status = healthStatusFromLastSeen(lastSeenIso ?? null);
  const { wifi, badge } = statusStyle(status);
  const [localLoop, setLocalLoop] = useState(imagenLoop);
  const [localPausa, setLocalPausa] = useState(imagenPausaSeg);

  useEffect(() => {
    setLocalLoop(imagenLoop);
    setLocalPausa(imagenPausaSeg);
  }, [imagenLoop, imagenPausaSeg, courtKey]);

  const sedeIndex = sedeIndexFromVenueName(venueName);
  const pizarraShortPath =
    sedeIndex
      ? buildPizarraShortPath(sedeIndex, displayCourtNum)
      : null;

  // Preferimos la URL corta (/sX/cY) porque permite previsualizar la pizarra sin conocer IDs de torneo/partido.
  // Fallback: preview embebido por cancha (+ filtro complex).
  const previewSrc = pizarraShortPath
    ? `/${pizarraShortPath}`
    : (venueName.trim().length > 0
        ? `/display/court/${displayCourtNum}?complex=${encodeURIComponent(venueName)}`
        : `/display/court/${displayCourtNum}`);

  const previewHref = pizarraShortPath ? `/${pizarraShortPath}` : null;

  const linked = new Set(linkedTiraIds);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-3 flex flex-col min-h-0">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Wifi className={`w-4 h-4 shrink-0 ${wifi}`} aria-hidden />
          <h3 className="text-sm font-black uppercase leading-tight text-white/95 truncate">{title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={`text-[9px] font-black uppercase tracking-tight px-2 py-0.5 rounded-full border ${badge}`}
            title={lastSeenIso ? `Última señal: ${lastSeenIso}` : 'Sin señal'}
          >
            {healthBadgeLabel(status)}
          </span>
          <span className="text-[10px] text-white/40 font-mono">{courtKey}</span>
        </div>
      </div>

      <div className="relative h-40 overflow-hidden rounded-xl border border-white/10 bg-black shrink-0">
        {previewHref && (
          <a
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="absolute top-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-black/70"
            title="Abrir pizarra en nueva pestaña"
          >
            Abrir smartpadel58.com/{pizarraShortPath}
          </a>
        )}
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

      <div className="mt-3 flex-1 min-h-0 flex flex-col overflow-y-auto max-h-[520px]">
        <CourtPlaylist title="Videos (en secuencia)" rows={videoRows} onRemove={onRemoveRow} />
        <div className="flex gap-1 mb-2">
          <button
            type="button"
            onClick={() => onAddClip('video')}
            className="flex-1 rounded-lg bg-white/10 hover:bg-white/15 text-[9px] font-black uppercase py-2 text-padel-primary"
          >
            <Plus className="inline w-3 h-3 mr-1" /> Video
          </button>
        </div>

        <CourtPlaylist title="Imágenes (duración por ítem)" rows={imageRows} onRemove={onRemoveRow} />
        <div className="flex gap-1 mb-2">
          <button
            type="button"
            onClick={() => onAddClip('imagen')}
            className="flex-1 rounded-lg bg-white/10 hover:bg-white/15 text-[9px] font-black uppercase py-2 text-padel-primary"
          >
            <Plus className="inline w-3 h-3 mr-1" /> Imagen
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-2 mb-3 space-y-2">
          <p className="text-[9px] font-black uppercase text-white/50 tracking-wider">Carrusel de imágenes</p>
          <label className="flex items-center gap-2 text-[10px] text-white/80 cursor-pointer">
            <input type="checkbox" checked={localLoop} onChange={(e) => setLocalLoop(e.target.checked)} />
            Loop (repetir al terminar)
          </label>
          <div className="flex items-center gap-2">
            <label className="text-[9px] text-white/50 shrink-0">Pausa extra entre fotos (s)</label>
            <input
              type="number"
              min={0}
              max={120}
              value={localPausa}
              onChange={(e) => setLocalPausa(Number(e.target.value) || 0)}
              className="w-16 bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:border-white/25 [color-scheme:dark]"
            />
          </div>
          <button
            type="button"
            onClick={() => onSaveImagenConfig(localLoop, localPausa)}
            className="w-full rounded-lg bg-white/10 hover:bg-white/15 text-[9px] font-black uppercase py-2 text-white/90"
          >
            Guardar opciones carrusel
          </button>
        </div>

        <p className="text-[9px] font-black uppercase text-white/50 tracking-wider mb-1">Tira informativa</p>
        <div className="rounded-xl border border-white/10 max-h-[100px] overflow-y-auto divide-y divide-white/5">
          {tiraList.length === 0 ? (
            <p className="text-[10px] text-white/40 p-2">Sin mensajes globales. Añade en la sección Ticker.</p>
          ) : (
            tiraList.map((t) => (
              <label key={t.id} className="flex items-start gap-2 px-2 py-1.5 cursor-pointer hover:bg-white/5">
                <input
                  type="checkbox"
                  checked={linked.has(t.id)}
                  onChange={(e) => onToggleTira(t.id, e.target.checked)}
                  className="mt-0.5 shrink-0"
                />
                <span className="text-[10px] text-white/85 leading-snug">{t.mensaje}</span>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
