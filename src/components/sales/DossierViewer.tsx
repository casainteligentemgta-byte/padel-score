'use client';

import { ExternalLink, FolderOpen } from 'lucide-react';
import { driveDossierUrls } from '@/lib/driveDossier';

export type DossierViewerProps = {
  /** ID de carpeta Google Drive (desde admin_settings). */
  folderId: string | null | undefined;
  className?: string;
};

/**
 * Vista embebida del dossier comercial (mobile-first, apta tablet en reunión).
 */
export function DossierViewer({ folderId, className = '' }: DossierViewerProps) {
  const id = folderId?.trim() || null;
  const urls = id ? driveDossierUrls(id) : null;

  if (!id || !urls) {
    return (
      <div
        className={`flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-black/40 px-6 py-10 text-center ${className}`}
      >
        <FolderOpen className="h-10 w-10 text-[#ccff00]/50" />
        <p className="max-w-sm text-sm text-zinc-400">
          Configura el ID del dossier en{' '}
          <span className="font-bold text-zinc-200">Admin → Publicidad</span> para mostrarlo aquí.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#ccff00]/90">Dossier comercial</h3>
        <a
          href={urls.open}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white hover:border-[#ccff00]/40 hover:bg-[#ccff00]/10"
        >
          <ExternalLink className="h-3.5 w-3.5 text-[#ccff00]" />
          Abrir en Drive
        </a>
      </div>
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_0_0_1px_rgba(204,255,0,0.06)]">
        <div className="aspect-[4/3] w-full min-h-[240px] sm:min-h-[320px] md:aspect-video md:min-h-[360px]">
          <iframe
            title="Dossier comercial Smart Padel"
            src={urls.embed}
            className="h-full w-full bg-black"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
      <p className="text-[10px] leading-relaxed text-zinc-500">
        Si el iframe aparece vacío, la carpeta puede ser privada: usa «Abrir en Drive» o comparte permisos de lectura con el cliente.
      </p>
    </div>
  );
}
