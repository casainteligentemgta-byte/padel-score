'use client';

import { useParams } from 'next/navigation';

/**
 * Lee un segmento de ruta dinámica en el cliente sin `use(Promise)`.
 * En React 19 + App Router, `use(params)` ha provocado #310 en transiciones/navegación.
 */
export function useRouteSegment(paramName: string): string {
    const params = useParams();
    const raw = params?.[paramName];
    return (Array.isArray(raw) ? raw[0] : raw) ?? '';
}
