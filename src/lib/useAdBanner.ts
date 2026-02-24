'use client';

import { useEffect, useState, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/rtdb';

export type AdMode = 'fija' | 'programada' | 'carrusel';

export interface AdState {
    mode: AdMode;
    currentImageUrl: string | null;
    isVisible: boolean;
}

/**
 * Hook reactivo del motor de publicidad.
 * Sincroniza publicidad_master desde RTDB y resuelve en tiempo real
 * qué imagen mostrar según el modo activo (fija / programada / carrusel).
 */
export function useAdBanner(): AdState {
    const [adData, setAdData] = useState<any>(null);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [serverTimeOffset, setServerTimeOffset] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── 1. Sincronizar offset de reloj con el servidor ──────────────────────
    useEffect(() => {
        const offsetRef = ref(rtdb, '.info/serverTimeOffset');
        const handler = (snap: any) => setServerTimeOffset(snap.val() || 0);
        onValue(offsetRef, handler);
        return () => off(offsetRef, 'value', handler);
    }, []);

    // ── 2. Escuchar publicidad_master en tiempo real ─────────────────────────
    useEffect(() => {
        const adRef = ref(rtdb, 'publicidad_master');
        const handler = (snap: any) => {
            const val = snap.val();
            setAdData(val);
            setCarouselIndex(0); // reset al cambiar configuración
        };
        onValue(adRef, handler);
        return () => off(adRef, 'value', handler);
    }, []);

    // ── 3. Carrusel: rotar imágenes ──────────────────────────────────────────
    useEffect(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (!adData || adData.modo !== 'carrusel' || !adData.carrusel_activo) return;

        const activeImages = getActiveImages(adData);
        if (activeImages.length <= 1) return;

        timerRef.current = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % activeImages.length);
        }, (adData.carrusel_intervalo_seg || 8) * 1000);

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [adData]);

    // ── 4. Resolver estado final ─────────────────────────────────────────────
    if (!adData) return { mode: 'fija', currentImageUrl: null, isVisible: false };

    const modo: AdMode = adData.modo || 'fija';

    if (modo === 'fija') {
        const url = adData.fija?.url || null;
        return { mode: 'fija', currentImageUrl: url, isVisible: !!url };
    }

    if (modo === 'programada') {
        const prog = adData.programada;
        if (!prog?.activa || !prog.url) {
            return { mode: 'programada', currentImageUrl: null, isVisible: false };
        }
        // Usamos tiempo del servidor para no ser manipulable por el cliente
        const serverNow = Date.now() + serverTimeOffset;
        const inRange = serverNow >= prog.inicio_unix_ms && serverNow <= prog.fin_unix_ms;
        return {
            mode: 'programada',
            currentImageUrl: inRange ? prog.url : null,
            isVisible: inRange,
        };
    }

    if (modo === 'carrusel') {
        if (!adData.carrusel_activo) {
            return { mode: 'carrusel', currentImageUrl: null, isVisible: false };
        }
        const images = getActiveImages(adData);
        if (images.length === 0) return { mode: 'carrusel', currentImageUrl: null, isVisible: false };
        const idx = carouselIndex % images.length;
        return { mode: 'carrusel', currentImageUrl: images[idx]?.url ?? null, isVisible: true };
    }

    return { mode: 'fija', currentImageUrl: null, isVisible: false };
}

function getActiveImages(adData: any): { url: string; orden: number }[] {
    if (!adData?.imagenes) return [];
    return Object.values(adData.imagenes as Record<string, any>)
        .filter((img: any) => img.activa && img.url)
        .sort((a: any, b: any) => a.orden - b.orden);
}
