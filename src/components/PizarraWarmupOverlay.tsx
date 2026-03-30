'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { dataService } from '@/lib/dataService';

/** Segundos restantes hasta `endsAt` (0 si expiró o no hay fin). */
export function useWarmupRemainingSec(endsAt: number | null | undefined): number {
    const [sec, setSec] = useState(0);
    useEffect(() => {
        const end = endsAt != null ? Number(endsAt) : NaN;
        if (!Number.isFinite(end)) {
            setSec(0);
            return;
        }
        const tick = () => {
            setSec(Math.max(0, Math.ceil((end - dataService.getSyncedNow()) / 1000)));
        };
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [endsAt]);
    return sec;
}

/** Duración por defecto del calentamiento (ms). */
export const PIZARRA_CALENTAMIENTO_MS = 3 * 60 * 1000;

export function parseCalentamientoEndsAt(raw: unknown): number | null {
    if (!raw || typeof raw !== 'object') return null;
    const e = Number((raw as { endsAt?: unknown }).endsAt);
    return Number.isFinite(e) && e > 0 ? e : null;
}

type PizarraWarmupOverlayProps = {
    endsAt: number | null | undefined;
    /** fullscreen: capa sobre el marcador; banner: franja compacta */
    layout?: 'fullscreen' | 'banner';
    className?: string;
};

/**
 * Cuenta regresiva sincronizada con `dataService.getSyncedNow()` hasta `endsAt`.
 * Si el tiempo ya expiró, no renderiza nada.
 */
export function PizarraWarmupOverlay({
    endsAt,
    layout = 'fullscreen',
    className = '',
}: PizarraWarmupOverlayProps) {
    const [sec, setSec] = useState(0);

    useEffect(() => {
        const end = endsAt != null ? Number(endsAt) : NaN;
        if (!Number.isFinite(end)) {
            setSec(0);
            return;
        }
        const tick = () => {
            const s = Math.max(0, Math.ceil((end - dataService.getSyncedNow()) / 1000));
            setSec(s);
        };
        tick();
        const id = setInterval(tick, 250);
        return () => clearInterval(id);
    }, [endsAt]);

    const endNum = endsAt != null ? Number(endsAt) : NaN;
    if (!Number.isFinite(endNum) || sec <= 0) return null;

    const mm = Math.floor(sec / 60);
    const ss = sec % 60;
    const text = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;

    if (layout === 'banner') {
        return (
            <div
                className={`flex items-center justify-center gap-3 rounded-2xl border border-padel-primary/40 bg-black/80 px-6 py-3 backdrop-blur-md ${className}`}
            >
                <span className="text-xs font-black uppercase tracking-[0.25em] text-padel-primary">Calentamiento</span>
                <span className="font-mono text-3xl font-black tabular-nums text-white">{text}</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center ${className}`}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className="relative z-10 px-8 text-center">
                <p className="mb-4 text-sm font-black uppercase tracking-[0.35em] text-padel-primary">Calentamiento</p>
                <p
                    className="font-black tabular-nums leading-none text-white"
                    style={{ fontSize: 'clamp(3.5rem, 14vw, 9rem)' }}
                >
                    {text}
                </p>
            </div>
        </motion.div>
    );
}
