import type { ReactNode } from 'react';
import { pizarraMetadata, pizarraViewport } from '@/lib/pizarraMetadata';

export const metadata = pizarraMetadata;
export const viewport = pizarraViewport;

export default function TvKioskLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
