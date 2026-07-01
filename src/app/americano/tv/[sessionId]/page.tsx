'use client';

import { use } from 'react';
import { AmericanoTvLayout } from '@/components/americano/AmericanoTvLayout';

type Props = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ debug?: string; venue?: string; complex?: string; court?: string }>;
};

export default function AmericanoTvPage({ params, searchParams }: Props) {
  const { sessionId } = use(params);
  const sp = use(searchParams);
  const debugMode = sp.debug === '1';
  const venueFromQuery = sp.venue || sp.complex || '';
  const highlightCourt = sp.court ? Math.max(1, parseInt(sp.court, 10) || 0) : undefined;

  return (
    <AmericanoTvLayout
      sessionId={sessionId}
      baseVenue={venueFromQuery}
      highlightCourt={highlightCourt}
      showDiagnostics={debugMode}
    />
  );
}
