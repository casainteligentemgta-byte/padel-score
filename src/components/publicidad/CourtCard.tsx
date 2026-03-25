'use client';

import CourtPlaylist from '@/components/publicidad/CourtPlaylist';
import type { MediaContent } from '@/lib/supabase/publicidad';
import { healthBadgeLabel, healthStatusFromLastSeen, type CourtHealthStatus } from '@/lib/courtHealth';
import { Plus, Wifi } from 'lucide-react';

export type CourtPlaylistRow = {
  id: string;
  cancha_id: string;
  orden: number;
  duracion_segundos: number;
  media_content?: MediaContent | null;
};

type CourtCardProps = {
  courtKey: string;
  displayCourtNum: number;
  title: string;
  rows: CourtPlaylistRow[];
  onAddToPlaylist: () => void;
  onRemoveRow: (id: string) => void;
  /** ISO last_seen desde public.canchas (heartbeat pizarra) */
  lastSeenIso?: string | null;
};

function statusStyle(status: CourtHealthStatus): { wifi: string; badge: string } {
  switch (status) {
    case 'online':
      return {
        wifi: 'text-emerald-400',
        badge: 'text-emerald-300 border-emerald-500/50 bg-emerald-500/15',
      };
    case 'warning':
      return {
        wifi: 'text-orange-400',
        badge: 'text-orange-300 border-orange-500/50 bg-orange-500/15',
      };
    case 'offline':
      return {
        wifi: 'text-red-500',
        badge: 'text-red-300 border-red-500/50 bg-red-500/15',
      };
    default:
      return {
        wifi: 'text-white/30',
        badge: 'text-white/30 border-white/20 bg-white/5',
      };
  }
}

export default function CourtCard({
  courtKey,
  displayCourtNum,
  title,
  rows,
  onAddToPlaylist,
  onRemoveRow,
  lastSeenIso,
}: CourtCardProps) {
  const status = healthStatusFromLastSeen(lastSeenIso ?? null);
  const { wifi, badge } = statusStyle(status);

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

      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-black shrink-0">
        <iframe
          src={`/display/court/${displayCourtNum}`}
          className="absolute top-0 left-0 border-0 pointer-events-none"
          style={{
            transform: 'scale(0.25)',
            transformOrigin: 'top left',
            width: '400%',
            height: '400%',
          }}
          title={`preview-${courtKey}`}
        />
      </div>

      <div className="mt-3 flex-1 min-h-0 flex flex-col">
        <p className="text-[10px] uppercase text-white/60 mb-2">Playlist</p>
        <div className="min-h-0 flex-1 max-h-[200px]">
          <CourtPlaylist rows={rows} onRemove={onRemoveRow} />
        </div>
      </div>

      <button
        type="button"
        onClick={onAddToPlaylist}
        className="mt-3 w-full rounded-xl bg-padel-primary text-black py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Añadir a Playlist
      </button>
    </div>
  );
}
