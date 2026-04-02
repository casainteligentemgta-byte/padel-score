import type { ReactNode } from 'react';
import { pizarraMetadata, pizarraViewport } from '@/lib/pizarraMetadata';

export const metadata = pizarraMetadata;
export const viewport = pizarraViewport;

/**
 * Pantallas de pizarra / TV: ancho completo del viewport (la tira y los bloques inferiores deben llegar a los bordes).
 */
export default function DisplayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full min-w-0 max-w-none flex-1 flex-col items-stretch self-stretch">
      {children}
    </div>
  );
}
