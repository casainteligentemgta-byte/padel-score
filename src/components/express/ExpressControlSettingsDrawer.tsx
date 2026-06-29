'use client';

import { MonitorPlay, Settings, Trophy, Type, X } from 'lucide-react';
import type { ExpressMatch } from '@/types/expressMatch';
import { ExpressControlDisplayPanel } from '@/components/express/ExpressControlDisplayPanel';
import { ExpressControlThirdSetPanel } from '@/components/express/ExpressControlThirdSetPanel';
import { ExpressControlTickerPanel } from '@/components/express/ExpressControlTickerPanel';
import type { ExpressThirdSetMode } from '@/lib/expressThirdSetMode';

type Props = {
  open: boolean;
  onClose: () => void;
  match: ExpressMatch;
  sessionId: string;
  onThirdSetModeSaved: (mode: ExpressThirdSetMode) => void;
  onNameScaleSaved: (scale: number) => void;
  onMediaScaleSaved: (scale: number) => void;
  onTickerPhrasesSaved: (phrases: string[]) => void;
};

function SettingsSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Settings;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-700 bg-neutral-900/80 p-4">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
        <Icon className="h-4 w-4 text-padel-primary" />
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ExpressControlSettingsDrawer({
  open,
  onClose,
  match,
  sessionId,
  onThirdSetModeSaved,
  onNameScaleSaved,
  onMediaScaleSaved,
  onTickerPhrasesSaved,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mt-auto flex max-h-[92dvh] flex-col rounded-t-3xl border border-neutral-700 bg-neutral-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-padel-primary" />
            <span className="text-sm font-black uppercase tracking-widest text-white">Ajustes</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-neutral-700 p-2 text-neutral-300 active:bg-neutral-800"
            aria-label="Cerrar ajustes"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
          <SettingsSection icon={Trophy} title="Formato 3er set">
            <ExpressControlThirdSetPanel
              embedded
              match={match}
              sessionId={sessionId}
              onModeSaved={onThirdSetModeSaved}
            />
          </SettingsSection>

          <SettingsSection icon={Type} title="Ajuste de pantalla">
            <ExpressControlDisplayPanel
              embedded
              mode="names"
              match={match}
              sessionId={sessionId}
              onNameScaleSaved={onNameScaleSaved}
              onMediaScaleSaved={onMediaScaleSaved}
            />
          </SettingsSection>

          <SettingsSection icon={MonitorPlay} title="Publicidad en TV">
            <p className="mb-3 text-[10px] leading-relaxed text-neutral-500">
              Escala de la franja de vídeo e imágenes. El contenido (playlists) lo configura el admin en{' '}
              <span className="text-neutral-400">Admin → Express · Publicidad</span>.
            </p>
            <ExpressControlDisplayPanel
              embedded
              mode="media"
              match={match}
              sessionId={sessionId}
              onNameScaleSaved={onNameScaleSaved}
              onMediaScaleSaved={onMediaScaleSaved}
            />
          </SettingsSection>

          <SettingsSection icon={Type} title="Tira informativa">
            <ExpressControlTickerPanel
              embedded
              match={match}
              onPhrasesSaved={onTickerPhrasesSaved}
            />
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
