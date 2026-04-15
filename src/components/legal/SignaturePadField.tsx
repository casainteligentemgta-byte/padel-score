'use client';

import { useEffect, useState } from 'react';
import type SignatureCanvas from 'react-signature-canvas';

export function SignaturePadField({
    padRef,
    onStrokeEnd,
}: {
    padRef: React.RefObject<SignatureCanvas | null>;
    onStrokeEnd?: (isEmpty: boolean) => void;
}) {
    const [Sig, setSig] = useState<typeof SignatureCanvas | null>(null);

    useEffect(() => {
        let alive = true;
        void import('react-signature-canvas').then((m) => {
            if (alive) setSig(() => m.default);
        });
        return () => {
            alive = false;
        };
    }, []);

    if (!Sig) {
        return (
            <div className="flex h-36 w-full items-center justify-center rounded-xl border-2 border-dashed border-[#ccff00]/30 bg-zinc-900/80 text-xs text-zinc-500">
                Cargando lienzo de firma…
            </div>
        );
    }

    return (
        <div className="relative w-full overflow-hidden rounded-xl border-2 border-[#ccff00]/70 bg-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(204,255,0,0.08)]">
            <Sig
                ref={padRef}
                clearOnResize
                minWidth={0.55}
                maxWidth={2.85}
                minDistance={2}
                throttle={16}
                velocityFilterWeight={0.85}
                penColor="#fafafa"
                backgroundColor="#0a0a0a"
                onEnd={() => {
                    const empty = padRef.current?.isEmpty() ?? true;
                    onStrokeEnd?.(empty);
                }}
                canvasProps={{
                    className: 'block h-36 w-full touch-none cursor-crosshair',
                    style: { touchAction: 'none' },
                }}
            />
        </div>
    );
}
