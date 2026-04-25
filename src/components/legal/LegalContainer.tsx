'use client';

import {
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
} from 'react';
import type SignatureCanvas from 'react-signature-canvas';
import { motion } from 'framer-motion';
import { type LegalFlowType } from '@/components/legal/PuntitoIA';
import { SignaturePadField } from '@/components/legal/SignaturePadField';
import { BiometricCapture } from '@/components/legal/BiometricCapture';
import { LegalTermsInscriptionBody, LegalTermsProPlayerBody } from '@/components/legal/LegalTermsBodies';
import { uploadToLegalVault } from '@/lib/legal/uploadLegalVault';
import { CURRENT_TERMS_VERSION } from '@/lib/legal/termsVersion';

export type LegalAcceptPayload = {
    signaturePath: string | null;
    biometricPath: string | null;
    version: string;
};

export type LegalContainerRef = {
    /** Guarda firma/biometría y ejecuta onAccept. Devuelve el payload o null si falta validación. */
    submitSignature: () => Promise<LegalAcceptPayload | null>;
};

export type LegalContainerProps = {
    type: LegalFlowType;
    userId: string | null | undefined;
    onAccept: (payload: LegalAcceptPayload) => void | Promise<void>;
    title?: string;
    children?: React.ReactNode;
    className?: string;
    /** Clases extra para ajustar el alto del bloque de lectura legal. */
    scrollAreaClassName?: string;
    /** Si es true, firma/biometría/progreso/aceptar se renderizan dentro del mismo scroll del contrato. */
    controlsInsideScroll?: boolean;
    /** false = el padre dispara el envío (p. ej. solo «Inscribirme») */
    showPrimaryButton?: boolean;
};

const LegalContainerInner = forwardRef<LegalContainerRef, LegalContainerProps>(function LegalContainer(
    {
        type,
        userId,
        onAccept,
        title,
        children,
        className = '',
        scrollAreaClassName = '',
        controlsInsideScroll = false,
        showPrimaryButton = true,
    },
    ref,
) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollPct, setScrollPct] = useState(0);
    const [scrollComplete, setScrollComplete] = useState(false);
    const padRef = useRef<SignatureCanvas | null>(null);
    const [sigEmpty, setSigEmpty] = useState(true);
    const [bioPath, setBioPath] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const recomputeScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const max = el.scrollHeight - el.clientHeight;
        if (max <= 1) {
            setScrollPct(100);
            setScrollComplete(true);
            return;
        }
        const pct = (el.scrollTop / max) * 100;
        setScrollPct(Math.min(100, Math.max(0, pct)));
        const thr = 3;
        setScrollComplete(el.scrollTop >= max - thr);
    }, []);

    useEffect(() => {
        recomputeScroll();
    }, [recomputeScroll, children, type]);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => recomputeScroll());
        ro.observe(el);
        return () => ro.disconnect();
    }, [recomputeScroll]);

    const onScroll = () => recomputeScroll();

    const hasValidation = !!bioPath;
    const canSubmit = hasValidation && !!userId; // Requiere validación facial guardada

    const defaultTitle =
        type === 'inscription' ? 'TERMINOS DE INSCRIPCION' : 'Contrato Pro Smart';

    const clearSignature = () => {
        padRef.current?.clear();
        setSigEmpty(true);
    };

    const buildAndSaveSignature = useCallback(async (): Promise<LegalAcceptPayload | null> => {
        if (!userId) {
            throw new Error('Debes iniciar sesión para completar la firma.');
        }
        if (!hasValidation) {
            throw new Error('Debes completar la validación facial antes de continuar.');
        }
        setSubmitting(true);
        try {
            let signaturePath: string | null = null;
            if (padRef.current && !padRef.current.isEmpty()) {
                const canvas = padRef.current.getTrimmedCanvas();
                const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), 'image/png'));
                if (blob) {
                    signaturePath = await uploadToLegalVault(userId, 'signature.png', blob, 'image/png');
                }
            }
            const payload: LegalAcceptPayload = {
                signaturePath,
                biometricPath: bioPath,
                version: CURRENT_TERMS_VERSION,
            };
            await onAccept(payload);
            return payload;
        } catch (e) {
            console.error(e);
            const msg = e instanceof Error ? e.message : String(e);
            if (showPrimaryButton) {
                alert(`Error al guardar la firma. ${msg}`);
                return null;
            }
            throw e instanceof Error ? e : new Error(msg);
        } finally {
            setSubmitting(false);
        }
    }, [hasValidation, userId, bioPath, onAccept, showPrimaryButton]);

    const handleAccept = async () => {
        await buildAndSaveSignature();
    };

    useImperativeHandle(
        ref,
        () => ({
            submitSignature: buildAndSaveSignature,
        }),
        [buildAndSaveSignature],
    );

    return (
        <div
            className={`relative flex min-h-0 flex-col rounded-3xl border border-white/10 bg-[#0a0a0a] font-sans text-zinc-100 ${className}`}
        >
            {/* Omitted title header for cleaner scroll experience */}


            <div
                ref={scrollRef}
                onScroll={onScroll}
                className={`legal-scroll-area min-h-[250px] max-h-[min(65vh,520px)] flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 text-justify ${scrollAreaClassName}`}
            >
                <div className="mb-6">
                    {children ?? (type === 'inscription' ? <LegalTermsInscriptionBody /> : <LegalTermsProPlayerBody />)}
                </div>

                {controlsInsideScroll && (
                    <>
                        <div className="space-y-4 border-t border-white/10 pt-4 pb-2">
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Firma digital</span>
                                    <button
                                        type="button"
                                        onClick={clearSignature}
                                        className="text-[10px] font-bold uppercase text-zinc-500 underline hover:text-white"
                                    >
                                        Limpiar
                                    </button>
                                </div>
                                <SignaturePadField
                                    padRef={padRef}
                                    onStrokeEnd={(empty) => {
                                        setSigEmpty(empty);
                                    }}
                                />
                            </div>

                            <div>
                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Alternativa biométrica</p>
                                <BiometricCapture
                                    userId={userId}
                                    onCapturedPath={(p) => {
                                        setBioPath(p);
                                    }}
                                />
                                {bioPath && (
                                    <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#ccff00]">
                                        Validación facial guardada
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5 border-t border-white/10 py-2">
                            <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                <span>Lectura del documento</span>
                                <span className={scrollComplete ? 'text-[#ccff00]' : 'text-zinc-400'}>{Math.round(scrollPct)}%</span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                                <motion.div
                                    className="h-full rounded-full bg-[#ccff00]"
                                    initial={false}
                                    animate={{ width: `${scrollPct}%` }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                                />
                            </div>
                        </div>

                        {showPrimaryButton && (
                            <div className="border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    disabled={!canSubmit || submitting}
                                    onClick={() => void handleAccept()}
                                    className="w-full rounded-2xl border-2 border-[#ccff00] bg-[#ccff00] py-3.5 text-sm font-black uppercase italic tracking-wide text-black shadow-[0_0_24px_rgba(204,255,0,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                                >
                                    {submitting ? 'Guardando…' : 'Aceptar y continuar'}
                                </button>
                                {!userId && <p className="text-center text-[10px] text-amber-200">Inicia sesión para completar la firma.</p>}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Signature + Biometric — fuera del scroll solo cuando no se fuerza integración */}
            {!controlsInsideScroll && (
            <div className="space-y-4 border-t border-white/10 px-5 pt-4 pb-2">
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Firma digital</span>
                        <button
                            type="button"
                            onClick={clearSignature}
                            className="text-[10px] font-bold uppercase text-zinc-500 underline hover:text-white"
                        >
                            Limpiar
                        </button>
                    </div>
                    <SignaturePadField
                        padRef={padRef}
                        onStrokeEnd={(empty) => {
                            setSigEmpty(empty);
                        }}
                    />
                </div>

                <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">Alternativa biométrica</p>
                    <BiometricCapture
                        userId={userId}
                        onCapturedPath={(p) => {
                            setBioPath(p);
                        }}
                    />
                    {bioPath && (
                        <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#ccff00]">
                            Validación facial guardada
                        </p>
                    )}
                </div>
            </div>
            )}

            {!controlsInsideScroll && (
            <div className="space-y-1.5 border-t border-white/10 px-5 py-2">
                <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <span>Lectura del documento</span>
                    <span className={scrollComplete ? 'text-[#ccff00]' : 'text-zinc-400'}>{Math.round(scrollPct)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <motion.div
                        className="h-full rounded-full bg-[#ccff00]"
                        initial={false}
                        animate={{ width: `${scrollPct}%` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                    />
                </div>
            </div>
            )}

            {!controlsInsideScroll && showPrimaryButton && (
                <div className="border-t border-white/10 px-5 py-4">
                    <button
                        type="button"
                        disabled={!canSubmit || submitting}
                        onClick={() => void handleAccept()}
                        className="w-full rounded-2xl border-2 border-[#ccff00] bg-[#ccff00] py-3.5 text-sm font-black uppercase italic tracking-wide text-black shadow-[0_0_24px_rgba(204,255,0,0.25)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:shadow-none"
                    >
                        {submitting ? 'Guardando…' : 'Aceptar y continuar'}
                    </button>
                    {!userId && <p className="text-center text-[10px] text-amber-200">Inicia sesión para completar la firma.</p>}
                </div>
            )}
            {!controlsInsideScroll && !showPrimaryButton && !userId && (
                <p className="border-t border-white/10 px-5 py-4 text-center text-[10px] text-amber-200">
                    Inicia sesión para completar la firma.
                </p>
            )}
        </div>
    );
});

export const LegalContainer = LegalContainerInner;
