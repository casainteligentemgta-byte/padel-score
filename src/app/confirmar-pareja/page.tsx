'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { confirmReservedTeam, dataService, isValidInscriptionId } from '@/lib/dataService';
import { useRouteSegment } from '@/lib/useRouteSegment';

type InscriptionPreview = Awaited<ReturnType<typeof dataService.getInscriptionById>>;

function vibrateConfirm(): void {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & { vibrate?: (pattern: number[]) => boolean };
    if (typeof nav.vibrate === 'function') nav.vibrate([100, 30, 100]);
}

function DarkSkeleton() {
    return (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 animate-pulse">
            <div className="h-6 w-3/4 bg-white/10 rounded mb-5" />
            <div className="h-4 w-full bg-white/10 rounded mb-2" />
            <div className="h-4 w-5/6 bg-white/10 rounded mb-2" />
            <div className="h-4 w-2/3 bg-white/10 rounded mb-7" />
            <div className="h-12 w-full bg-white/10 rounded-xl" />
        </div>
    );
}

function ConfettiBurst() {
    const particles = Array.from({ length: 20 }).map((_, i) => i);
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 0.9 }}
                    animate={{
                        opacity: 0,
                        y: 220 + (i % 5) * 15,
                        x: (i - 10) * 16,
                        rotate: (i % 2 === 0 ? 1 : -1) * 280,
                        scale: 1.1,
                    }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: (i % 6) * 0.03 }}
                    className="absolute left-1/2 top-[18%] w-2.5 h-5 rounded-sm"
                    style={{ backgroundColor: i % 3 === 0 ? '#ccff00' : i % 3 === 1 ? '#22d3ee' : '#f472b6' }}
                />
            ))}
        </div>
    );
}

export default function ConfirmarParejaPage() {
    const router = useRouter();
    const idFromRoute = useRouteSegment('id');
    const inscriptionId = useMemo(() => (idFromRoute || '').trim(), [idFromRoute]);
    const idValid = isValidInscriptionId(inscriptionId);

    const { user, loading: authLoading } = useAuth();
    const [fetching, setFetching] = useState(true);
    const [sending, setSending] = useState(false);
    const [inscription, setInscription] = useState<InscriptionPreview>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!idValid) {
            setFetching(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const row = await dataService.getInscriptionById(inscriptionId);
                if (!cancelled) setInscription(row);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'No pudimos cargar la invitación.');
            } finally {
                if (!cancelled) setFetching(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [inscriptionId, idValid]);

    useEffect(() => {
        if (!success) return;
        const t = window.setTimeout(() => router.push('/hub'), 2500);
        return () => window.clearTimeout(t);
    }, [success, router]);

    const handleConfirm = useCallback(async () => {
        if (!idValid || !inscriptionId) return;
        setError(null);
        setSending(true);
        try {
            vibrateConfirm();
            await confirmReservedTeam(inscriptionId);
            setSuccess(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo confirmar la pareja.');
        } finally {
            setSending(false);
        }
    }, [idValid, inscriptionId]);

    const status = String(inscription?.inscriptionStatus ?? 'NORMAL').toUpperCase();
    const isAlreadyConfirmed = status === 'CONFIRMED';

    const player1Name = inscription?.participantName?.trim() || 'Tu compañero';
    const tournamentName = inscription?.tournamentName?.trim() || 'torneo';

    return (
        <div className="min-h-screen bg-[#080808] text-white font-outfit relative overflow-hidden flex items-center justify-center px-4">
            <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-padel-primary/5 rounded-full blur-[130px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-cyan-500/5 rounded-full blur-[110px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            {!idValid ? (
                <div className="relative z-10 w-full max-w-md rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-center">
                    <AlertCircle className="w-11 h-11 mx-auto mb-3 text-amber-300" />
                    <h1 className="font-black text-xl mb-2 uppercase">Enlace inválido</h1>
                    <p className="text-sm text-white/75 mb-6">No encontramos un ID válido en la ruta de confirmación.</p>
                    <Link href="/hub" className="inline-flex items-center gap-2 rounded-full bg-padel-primary px-5 py-2.5 text-black font-bold">
                        Ir al Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : authLoading || fetching ? (
                <DarkSkeleton />
            ) : (
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="ok"
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-7 text-center overflow-hidden"
                        >
                            <ConfettiBurst />
                            <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-emerald-300" />
                            <h2 className="text-2xl font-black tracking-tight uppercase">¡LUGAR ASEGURADO!</h2>
                            <p className="text-sm text-white/75 mt-2">¡Listo! Le hemos avisado a tu compañero por email.</p>
                            <p className="text-xs text-white/50 mt-1">Redirigiendo al hub...</p>
                        </motion.div>
                    ) : isAlreadyConfirmed ? (
                        <motion.div
                            key="already"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative z-10 w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.04] p-7 text-center"
                        >
                            <h1 className="text-xl font-black uppercase mb-2">Equipo listo</h1>
                            <p className="text-sm text-white/70 mb-6">
                                Esta inscripción ya está en estado <span className="font-bold text-emerald-300">CONFIRMED</span>.
                            </p>
                            <Link href="/hub" className="inline-flex items-center gap-2 rounded-full bg-padel-primary px-5 py-2.5 text-black font-bold">
                                Ir al Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="invite"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8"
                        >
                            <h1 className="text-2xl font-black tracking-tight mb-4">
                                🎾 ¡PREPÁRATE! {player1Name} te ha invitado a su equipo para el {tournamentName}
                            </h1>
                            <p className="text-sm text-white/65 mb-6">Confirma tu lugar ahora para cerrar la pareja.</p>
                            {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}
                            <motion.button
                                type="button"
                                onClick={handleConfirm}
                                disabled={sending || !user}
                                whileTap={{ scale: sending ? 1 : 0.98 }}
                                className="w-full rounded-xl bg-padel-primary py-3.5 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
                            >
                                {sending ? 'Confirmando...' : 'Confirmar'}
                            </motion.button>
                            <Link href="/hub" className="mt-4 block text-center text-xs font-bold text-white/45 hover:text-white/70">
                                Ir al Dashboard
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
