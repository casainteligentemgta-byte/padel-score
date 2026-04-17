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
    /** El vídeo ya tiene dimensiones reales (evita captura en negro en móviles/WebViews). */
    const [videoReady, setVideoReady] = useState(false);
    const [saving, setSaving] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const stopStream = useCallback(() => {
        const v = videoRef.current;
        if (v?.srcObject) {
            (v.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            v.srcObject = null;
        }
        setStreaming(false);
        setVideoReady(false);
    }, []);

    const openCamera = async () => {
        if (!userId) {
            alert('Debes iniciar sesión para la validación facial.');
            return;
        }
        setOpen(true);
        setVideoReady(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            const v = videoRef.current;
            if (v) {
                v.srcObject = stream;
                await v.play();
                if (v.videoWidth > 0 && v.videoHeight > 0) {
                    setVideoReady(true);
                }
            }
            setStreaming(true);
        } catch (e) {
            console.error(e);
            alert('No se pudo acceder a la cámara.');
            setOpen(false);
        }
    };

    const onVideoMeta = useCallback(() => {
        const v = videoRef.current;
        if (v && v.videoWidth > 0 && v.videoHeight > 0) {
            setVideoReady(true);
        }
    }, []);

    const capture = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || !userId) {
            alert('No se pudo acceder a la cámara. Cierra e inténtalo de nuevo.');
            return;
        }
        if (!videoReady || (video.videoWidth ?? 0) < 2 || (video.videoHeight ?? 0) < 2) {
            alert('Espera un momento hasta que se vea la imagen de la cámara y vuelve a pulsar Guardar captura.');
            return;
        }
        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            alert('No se pudo preparar la captura en este dispositivo.');
            return;
        }
        setSaving(true);
        ctx.drawImage(video, 0, 0, w, h);
        stopStream();

        try {
            await new Promise<void>((resolve, reject) => {
                canvas.toBlob(
                    async (blob) => {
                        try {
                            if (!blob) {
                                reject(new Error('No se pudo generar la imagen (blob vacío).'));
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
            });
            setOpen(false);
        } catch (err) {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            alert(`No se pudo guardar la captura. ${msg}`);
            onCapturedPath(null);
        } finally {
            setSaving(false);
        }
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
                                <video
                                    ref={videoRef}
                                    className="h-full w-full object-cover"
                                    playsInline
                                    muted
                                    onLoadedMetadata={onVideoMeta}
                                    onLoadedData={onVideoMeta}
                                />
                                {(!streaming || !videoReady) && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-3 text-center text-xs text-zinc-300">
                                        {streaming && !videoReady ? 'Preparando imagen…' : 'Iniciando cámara…'}
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                disabled={!streaming || !videoReady || saving}
                                onClick={() => void capture()}
                                className="mt-4 w-full rounded-2xl bg-[#ccff00] py-3 text-sm font-black uppercase text-black disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {saving ? 'Guardando…' : 'Guardar captura'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
