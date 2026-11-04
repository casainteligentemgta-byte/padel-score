'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export type AppToastKind = 'ok' | 'err';

export type AppToastDetail = {
    message: string;
    kind?: AppToastKind;
};

export function showToast(message: string, kind: AppToastKind = 'ok'): void {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new CustomEvent<AppToastDetail>('app-toast', { detail: { message, kind } }));
}

export function ToastHost() {
    const [toast, setToast] = useState<(AppToastDetail & { id: number }) | null>(null);

    useEffect(() => {
        let hide: ReturnType<typeof setTimeout> | null = null;
        const onToast = (ev: Event) => {
            const detail = (ev as CustomEvent<AppToastDetail>).detail;
            if (!detail?.message) return;
            setToast({ id: Date.now(), message: detail.message, kind: detail.kind || 'ok' });
            if (hide) clearTimeout(hide);
            hide = setTimeout(() => setToast(null), 4200);
        };
        window.addEventListener('app-toast', onToast as EventListener);
        return () => {
            window.removeEventListener('app-toast', onToast as EventListener);
            if (hide) clearTimeout(hide);
        };
    }, []);

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[200] flex justify-center px-4">
            <AnimatePresence>
                {toast ? (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl ${
                            toast.kind === 'err'
                                ? 'border-rose-400/30 bg-[#1a0b0d] text-rose-100'
                                : 'border-padel-primary/30 bg-[#12160a] text-white'
                        }`}
                    >
                        {toast.kind === 'err' ? (
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        ) : (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-padel-primary" />
                        )}
                        <p className="text-sm font-semibold leading-snug">{toast.message}</p>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
