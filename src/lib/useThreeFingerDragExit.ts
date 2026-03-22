'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Píxeles de arrastre vertical (3 dedos) para disparar la salida */
const MIN_DRAG_PX = 110;

/**
 * Salida oculta en móvil / iPad: tres dedos sobre la pantalla y arrastrar claramente hacia arriba o hacia abajo.
 * No muestra UI; evita quedar atrapado en pantalla completa sin botón atrás.
 */
export function useThreeFingerDragExit(exitHref: string | null | undefined) {
    const router = useRouter();

    useEffect(() => {
        if (!exitHref || typeof window === 'undefined') return;

        let startY = 0;
        let lastY = 0;
        let armed = false;
        let sawThreeMove = false;

        const avgY3 = (tl: TouchList) => (tl[0].clientY + tl[1].clientY + tl[2].clientY) / 3;

        const onStart = (e: TouchEvent) => {
            if (e.touches.length === 3) {
                armed = true;
                sawThreeMove = false;
                startY = lastY = avgY3(e.touches);
            }
        };

        const onMove = (e: TouchEvent) => {
            if (!armed) return;
            if (e.touches.length === 3) {
                lastY = avgY3(e.touches);
                sawThreeMove = true;
            }
        };

        const onEnd = (e: TouchEvent) => {
            if (e.touches.length !== 0) return;
            if (!armed || !sawThreeMove) {
                armed = false;
                return;
            }
            armed = false;
            const dy = lastY - startY;
            if (Math.abs(dy) >= MIN_DRAG_PX) {
                router.push(exitHref);
            }
        };

        const onCancel = () => {
            armed = false;
            sawThreeMove = false;
        };

        const opts: AddEventListenerOptions = { passive: true, capture: true };
        window.addEventListener('touchstart', onStart, opts);
        window.addEventListener('touchmove', onMove, opts);
        window.addEventListener('touchend', onEnd, opts);
        window.addEventListener('touchcancel', onCancel, opts);

        return () => {
            window.removeEventListener('touchstart', onStart, { capture: true } as EventListenerOptions);
            window.removeEventListener('touchmove', onMove, { capture: true } as EventListenerOptions);
            window.removeEventListener('touchend', onEnd, { capture: true } as EventListenerOptions);
            window.removeEventListener('touchcancel', onCancel, { capture: true } as EventListenerOptions);
        };
    }, [exitHref, router]);
}
