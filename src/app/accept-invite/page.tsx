'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';

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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function AcceptInviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const teamId = useMemo(() => (searchParams.get('teamId') || '').trim(), [searchParams]);
    const idValid = UUID_RE.test(teamId);

    const { user, loading: authLoading } = useAuth();
    const [resolving, setResolving] = useState(true);
    const [inscriptionId, setInscriptionId] = useState<string | null>(null);
    const [preview, setPreview] = useState<Awaited<ReturnType<typeof dataService.getInscriptionById>>>(null);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!idValid) {
            setResolving(false);
            return;
        }
        if (authLoading) return;
        if (!user) {
            setResolving(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                setResolving(true);
                const ins = await dataService.getInscriptionIdForPartnerTeam(teamId);
                if (cancelled) return;
                if (!ins) {
                    setInscriptionId(null);
                    setPreview(null);
                    setError('No pudimos vincular esta invitación con tu cuenta, o el enlace expiró.');
                } else {
                    setInscriptionId(ins);
                    setError(null);
                    const row = await dataService.getInscriptionById(ins);
                    if (!cancelled) setPreview(row);
                }
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : 'No se pudo cargar la invitación.');
            } finally {
                if (!cancelled) setResolving(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [idValid, teamId, user, authLoading]);

    useEffect(() => {
        if (!success) return;
        const t = window.setTimeout(() => router.push('/dashboard'), 2500);
        return () => window.clearTimeout(t);
    }, [success, router]);

    const handleConfirm = useCallback(async () => {
        if (!idValid || !teamId) return;
        if (!inscriptionId) {
            setError('No hay inscripción vinculada. Comprueba que inicies con la misma cuenta que usó tu compañero al reservar.');
            return;
        }
        setError(null);
        setSending(true);
        try {
            vibrateConfirm();
            await dataService.confirmReservedTeam(inscriptionId);
            setSuccess(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'No se pudo aceptar la invitación.');
        } finally {
            setSending(false);
        }
    }, [idValid, teamId, inscriptionId]);

    const loginHref = useMemo(() => {
        const next = `/accept-invite?teamId=${encodeURIComponent(teamId)}`;
        return `/login?next=${encodeURIComponent(next)}`;
    }, [teamId]);

    const status = String(preview?.inscriptionStatus ?? 'NORMAL').toUpperCase();
    const isAlreadyConfirmed = status === 'CONFIRMED';

    const player1Name = preview?.participantName?.trim() || 'Tu compañero';
    const tournamentName = preview?.tournamentName?.trim() || 'el torneo';

    return (
        <div className="min-h-screen bg-[#080808] text-white font-outfit relative overflow-hidden flex items-center justify-center px-4">
            <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-padel-primary/5 rounded-full blur-[130px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-cyan-500/5 rounded-full blur-[110px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

            {!idValid ? (
                <div className="relative z-10 w-full max-w-md rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 text-center">
                    <AlertCircle className="w-11 h-11 mx-auto mb-3 text-amber-300" />
                    <h1 className="font-black text-xl mb-2 uppercase">Enlace inválido</h1>
                    <p className="text-sm text-white/75 mb-6">Falta o no es válido el parámetro <span className="font-mono">teamId</span> del enlace.</p>
                    <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-padel-primary px-5 py-2.5 text-black font-bold">
                        Ir al Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : authLoading || resolving ? (
                <DarkSkeleton />
            ) : !user ? (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 text-center"
                >
                    <h1 className="text-2xl font-black tracking-tight mb-2">Acepta tu pareja</h1>
                    <p className="text-sm text-white/65 mb-6">
                        Inicia sesión o regístrate con la <span className="font-bold text-white">misma cuenta</span> (correo o método) vinculada
                        a tu ficha, luego vuelve aquí para firmar y confirmar.
                    </p>
                    <Link
                        href={loginHref}
                        className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-padel-primary py-3.5 text-sm font-black uppercase tracking-wide text-black"
                    >
                        Iniciar sesión o registro
                    </Link>
                    <Link href="/dashboard" className="mt-4 block text-center text-xs font-bold text-white/45 hover:text-white/70">
                        Ir al Dashboard
                    </Link>
                </motion.div>
            ) : error && !inscriptionId ? (
                <div className="relative z-10 w-full max-w-md rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center">
                    <AlertCircle className="w-10 h-10 mx-auto mb-2 text-rose-300" />
                    <p className="text-sm text-white/85 mb-4">{error}</p>
                    <Link href={loginHref} className="text-padel-primary font-bold text-sm">
                        Probar otra sesión
                    </Link>
                </div>
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
                            <p className="text-sm text-white/75 mt-2">Hemos notificado a tu compañero.</p>
                            <p className="text-xs text-white/50 mt-1">Redirigiendo al hub…</p>
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
                                Esta inscripción ya está <span className="font-bold text-emerald-300">CONFIRMED</span>.
                            </p>
                            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-padel-primary px-5 py-2.5 text-black font-bold">
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
                                🎾 ¡Hola! {player1Name} te ha reservado lugar en {tournamentName}
                            </h1>
                            <p className="text-sm text-white/65 mb-6">Confirma ahora completando el acuerdo (firma) y cerrar la pareja en la app.</p>
                            {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}
                            <motion.button
                                type="button"
                                onClick={handleConfirm}
                                disabled={sending || !inscriptionId}
                                whileTap={{ scale: sending ? 1 : 0.98 }}
                                className="w-full rounded-xl bg-padel-primary py-3.5 text-sm font-black uppercase tracking-wide text-black disabled:opacity-50"
                            >
                                {sending ? 'Confirmando…' : 'Confirmar mi lugar'}
                            </motion.button>
                            <Link href="/dashboard" className="mt-4 block text-center text-xs font-bold text-white/45 hover:text-white/70">
                                Ir al Dashboard
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4">
                    <DarkSkeleton />
                </div>
            }
        >
            <AcceptInviteContent />
        </Suspense>
    );
}
