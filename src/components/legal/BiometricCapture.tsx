'use client';

import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X } from 'lucide-react';

export function BiometricCapture({
    userId,
    onCapturedPath,
    accentClassName = 'border-[#ccff00] text-[#ccff00]',
}: {
    userId: string | null | undefined;
    onCapturedPath: (path: string | null) => void;
    accentClassName?: string;
}) {
    const [open, setOpen] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopStream = useCallback(() => {
        const v = videoRef.current;
        if (v?.srcObject) {
            (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            v.srcObject = null;
        }
        setStreaming(false);
    }, []);

    const openCamera = async () => {
        if (!userId) {
            alert('Debes iniciar sesión para la validación facial.');
            return;
        }
        setOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            setStreaming(true);
        } catch (e) {
            console.error(e);
            alert('No se pudo acceder a la cámara.');
            setOpen(false);
        }
    };

    const capture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !userId) return;
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        stopStream();

        await new Promise<void>((resolve, reject) => {
            canvas.toBlob(
                async (blob) => {
                    try {
                        if (!blob) {
                            onCapturedPath(null);
                            resolve();
                            return;
                        }
                        const { uploadToLegalVault } = await import('@/lib/legal/uploadLegalVault');
                        const path = await uploadToLegalVault(userId, 'face-validation.jpg', blob, 'image/jpeg');
                        onCapturedPath(path);
                        resolve();
                    } catch (err) {
                        reject(err);
                    }
                },
                'image/jpeg',
                0.88
            );
        }).catch((err) => {
            console.error(err);
            alert('No se pudo guardar la captura. Revisa el bucket legal_vault en Supabase.');
            onCapturedPath(null);
        });

        setOpen(false);
    };

    const close = () => {
        stopStream();
        setOpen(false);
    };

    return (
        <>
            <button
                type="button"
                onClick={() => void openCamera()}
                disabled={!userId}
                className={`flex w-full items-center justify-center gap-2 rounded-xl border-2 bg-zinc-950 py-3 text-xs font-black uppercase tracking-wider transition hover:bg-zinc-900 disabled:opacity-40 ${accentClassName}`}
            >
                <Camera className="h-4 w-4" />
                Capturar validación facial
            </button>
            <canvas ref={canvasRef} className="hidden" />

            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.button
                            type="button"
                            aria-label="Cerrar"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90"
                            onClick={close}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            className="relative z-[201] w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#ccff00]/50 bg-[#0a0a0a] p-4 shadow-2xl"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-sm font-black uppercase text-white">Validación facial</p>
                                <button type="button" onClick={close} className="rounded-full bg-white/10 p-2 hover:bg-white/15">
                                    <X className="h-4 w-4 text-zinc-300" />
                                </button>
                            </div>
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black">
                                <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                                {!streaming && <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">Iniciando cámara…</div>}
                            </div>
                            <button
                                type="button"
                                disabled={!streaming}
                                onClick={() => void capture()}
                                className="mt-4 w-full rounded-2xl bg-[#ccff00] py-3 text-sm font-black uppercase text-black disabled:opacity-40"
                            >
                                Guardar captura
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
