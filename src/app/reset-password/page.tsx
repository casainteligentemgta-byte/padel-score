'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { SIGNUP_PASSWORD_REQUIREMENTS, validateSignupPassword } from '@/lib/authValidators';
import { SignupPasswordValidator } from '@/components/SignupPasswordValidator';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';
import BouncingBall from '@/components/BouncingBall';
import Link from 'next/link';

function parseHashParams(): URLSearchParams {
    if (typeof window === 'undefined') return new URLSearchParams();
    return new URLSearchParams(window.location.hash.replace(/^#/, ''));
}

function ResetPasswordForm() {
    const router = useRouter();
    const supabase = getSupabaseClient();
    const [ready, setReady] = useState(false);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    const passwordOk = useMemo(
        () => SIGNUP_PASSWORD_REQUIREMENTS.every((rule) => rule.test(password)),
        [password]
    );

    useEffect(() => {
        if (!supabase) {
            setChecking(false);
            setError('Supabase no está configurado.');
            return;
        }

        let cancelled = false;
        const hash = parseHashParams();
        const search = new URLSearchParams(window.location.search);
        const code = search.get('code');
        const type = search.get('type') || hash.get('type');
        const errorDescription = search.get('error_description') || hash.get('error_description');

        if (errorDescription) {
            setError(decodeURIComponent(errorDescription.replace(/\+/g, ' ')));
            setChecking(false);
            return;
        }

        const markReady = () => {
            if (!cancelled) {
                setReady(true);
                setChecking(false);
                setError(null);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                markReady();
                return;
            }
            if (session && type === 'recovery') {
                markReady();
            }
        });

        (async () => {
            try {
                const { data: { session: existing } } = await supabase.auth.getSession();
                if (existing) {
                    markReady();
                    return;
                }
                if (code) {
                    const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
                    if (exErr) throw exErr;
                    markReady();
                    return;
                }
                if (hash.get('access_token') && type === 'recovery') {
                    markReady();
                    return;
                }
                if (!cancelled) {
                    setChecking(false);
                    setError('El enlace de recuperación no es válido o ya expiró. Solicita uno nuevo.');
                }
            } catch (e) {
                if (!cancelled) {
                    setChecking(false);
                    setError(getAuthErrorMessage(e) || 'No se pudo validar el enlace de recuperación.');
                }
            }
        })();

        return () => {
            cancelled = true;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!supabase) {
            setError('Supabase no está configurado.');
            return;
        }
        const check = validateSignupPassword(password);
        if (!check.valid) {
            setError(check.error || 'La contraseña no cumple los requisitos.');
            return;
        }
        if (password !== confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }
        setSaving(true);
        try {
            const { error: updErr } = await supabase.auth.updateUser({ password });
            if (updErr) throw updErr;
            setSuccess(true);
            await supabase.auth.signOut();
            setTimeout(() => router.replace('/login?reset=1'), 1200);
        } catch (e) {
            setError(getAuthErrorMessage(e) || 'No se pudo guardar la nueva contraseña.');
        } finally {
            setSaving(false);
        }
    };

    if (checking) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#050505]">
                <BouncingBall size={40} bounceHeight={2} />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 text-white">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ccff00 1px, transparent 1px), linear-gradient(to bottom, #ccff00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <h1 className="mb-2 text-center text-3xl font-black italic uppercase tracking-tighter">
                    Nueva <span className="text-padel-primary">contraseña</span>
                </h1>
                <p className="mb-8 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                    Recuperación de acceso
                </p>

                {success ? (
                    <div className="rounded-2xl border border-padel-primary/20 bg-padel-primary/5 p-6 text-center">
                        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-padel-primary" />
                        <p className="text-sm font-bold">Contraseña actualizada. Te llevamos a iniciar sesión.</p>
                    </div>
                ) : !ready ? (
                    <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-6 text-center">
                        <AlertCircle className="mx-auto mb-3 h-10 w-10 text-amber-300" />
                        <p className="mb-4 text-sm text-white/80">{error || 'Abre el enlace del correo de recuperación para continuar.'}</p>
                        <Link href="/login" className="text-sm font-black uppercase tracking-widest text-padel-primary">
                            Volver al login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-padel-primary/70" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                placeholder="NUEVA CONTRASEÑA"
                                className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-16 pr-14 text-sm font-bold outline-none focus:border-padel-primary/50"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent p-2 text-zinc-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <SignupPasswordValidator password={password} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="REPETIR CONTRASEÑA"
                            className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-6 text-sm font-bold outline-none focus:border-padel-primary/50"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                        />
                        {error ? (
                            <div className="flex items-start gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                <p className="text-[11px] font-bold uppercase tracking-wide text-red-300">{error}</p>
                            </div>
                        ) : null}
                        <button
                            type="submit"
                            disabled={saving || !passwordOk}
                            className="flex h-14 w-full items-center justify-center rounded-2xl bg-padel-primary text-sm font-black uppercase tracking-widest text-black disabled:opacity-40"
                        >
                            {saving ? 'Guardando…' : 'Guardar contraseña'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-dvh items-center justify-center bg-[#050505]">
                    <BouncingBall size={40} bounceHeight={2} />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
