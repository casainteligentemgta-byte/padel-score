'use client';

import { useState } from 'react';

export type AdMode = 'fija' | 'programada' | 'carrusel';

export interface AdState {
    mode: AdMode;
    currentImageUrl: string | null;
    isVisible: boolean;
}

/**
 * Hook del motor de publicidad. Migrado de RTDB a estado local por defecto.
 * Devuelve modo fija sin URL para no depender de Firebase.
 * Para carrusel/programada se puede conectar después a Supabase (tabla publicidad_master o similar).
 */
export function useAdBanner(): AdState {
    const [state] = useState<AdState>({ mode: 'fija', currentImageUrl: null, isVisible: false });
    return state;
}
