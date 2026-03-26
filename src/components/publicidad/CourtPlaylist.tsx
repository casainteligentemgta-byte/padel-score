'use client';

import { X } from 'lucide-react';

type PlaylistRow = {
  id: string;
  orden: number;
  duracion_segundos: number;
  media_content?: { nombre_sponsor?: string | null; nombre?: string | null } | null;
};

export default function CourtPlaylist({
  title,
  rows,
  onRemove,
}: {
  title: string;
  rows: PlaylistRow[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mb-3">
      <p className="text-[9px] font-black uppercase text-padel-primary/90 mb-1 tracking-wider">{title}</p>
      <div className="overflow-auto rounded-xl border border-white/10 max-h-[120px]">
        <table className="w-full text-left">
          <thead className="bg-black/40">
            <tr>
              <th className="px-2 py-1 text-[9px] text-white/60">Media</th>
              <th className="px-2 py-1 text-[9px] text-white/60">Ord</th>
              <th className="px-2 py-1 text-[9px] text-white/60">Seg</th>
              <th className="px-2 py-1 text-[9px] text-white/60" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="px-2 py-1 text-[10px] text-white/90 truncate max-w-[100px]">
                  {r.media_content?.nombre_sponsor || r.media_content?.nombre || 'Media'}
                </td>
                <td className="px-2 py-1 text-[10px] text-white/70">{r.orden}</td>
                <td className="px-2 py-1 text-[10px] text-white/70">{r.duracion_segundos}s</td>
                <td className="px-2 py-1 text-right">
                  <button type="button" onClick={() => onRemove(r.id)} className="p-1 rounded bg-red-500/10 text-red-400">
                    <X size={12} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-2 py-3 text-[10px] text-white/40 text-center" colSpan={4}>
                  Vacío
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
