'use client';

import { use } from 'react';
import { AmericanoTvLayout } from '@/components/americano/AmericanoTvLayout';

type Props = {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ debug?: string; venue?: string; complex?: string }>;
};

export default function AmericanoTvPage({ params, searchParams }: Props) {
  const { sessionId } = use(params);
  const sp = use(searchParams);
  const debugMode = sp.debug === '1';
  const venueFromQuery = sp.venue || sp.complex || '';

  return (
    <AmericanoTvLayout
      sessionId={sessionId}
      baseVenue={venueFromQuery}
      showDiagnostics={debugMode}
    />
  );
}
