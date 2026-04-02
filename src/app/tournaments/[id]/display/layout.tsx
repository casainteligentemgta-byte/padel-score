import type { ReactNode } from 'react';
import { pizarraMetadata, pizarraViewport } from '@/lib/pizarraMetadata';

export const metadata = pizarraMetadata;
export const viewport = pizarraViewport;

export default function TournamentDisplayLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
