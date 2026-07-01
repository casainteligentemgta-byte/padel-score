'use client';

import { useState } from 'react';
import { Download, Loader2, Share2 } from 'lucide-react';
import {
  downloadAmericanoSchedulePdf,
  shareAmericanoSchedulePdf,
  type AmericanoPdfInput,
} from '@/lib/americano/americanoSchedulePdf';

type Props = {
  input: AmericanoPdfInput | null;
  disabled?: boolean;
  compact?: boolean;
};

export function AmericanoExportPdfButtons({ input, disabled, compact }: Props) {
  const [busy, setBusy] = useState<'download' | 'share' | null>(null);

  const handleDownload = () => {
    if (!input || disabled) return;
    setBusy('download');
    try {
      downloadAmericanoSchedulePdf(input);
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (!input || disabled) return;
    setBusy('share');
    try {
      await shareAmericanoSchedulePdf(input);
    } finally {
      setBusy(null);
    }
  };

  const btnClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:border-amber-400/40 disabled:opacity-50'
    : 'inline-flex items-center gap-2 rounded-xl border border-padel-primary/30 bg-padel-primary/10 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-padel-primary hover:bg-padel-primary/15 disabled:opacity-50';

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={!input || disabled || busy !== null}
        className={btnClass}
      >
        {busy === 'download' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        PDF
      </button>
      <button
        type="button"
        onClick={() => void handleShare()}
        disabled={!input || disabled || busy !== null}
        className={btnClass}
      >
        {busy === 'share' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Compartir
      </button>
    </div>
  );
}
