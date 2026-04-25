'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Lock,
    Chrome,
    User,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    ChevronRight,
    Zap,
    Eye,
    EyeOff,
    Shield,
    ShieldCheck,
    Layout,
    Fingerprint,
    Circle,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isValidEmail, isValidPassword, validateSignupPassword } from '@/lib/authValidators';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BouncingBall from '@/components/BouncingBall';
import { getSupabaseClient } from '@/lib/supabase/client';
import LegalModal from '@/components/legal/LegalModal';
import { getAuthHeaders } from '@/lib/apiAuth';
import { isAdminAccess } from '@/lib/adminAccess';

type PasswordRequirement = {
    label: string;
    regex: RegExp;
};

function safeInternalNextPath(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const t = String(raw).trim();
    if (!t.startsWith('/') || t.startsWith('//') || t.includes('://') || t.includes('..')) {
        return null;
    }
    return t;
}

const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
    { label: '6-12 caracteres', regex: /^.{6,12}$/ },
    { label: 'Mayúscula y Minúscula', regex: /^(?=.*[a-z])(?=.*[A-Z]).+$/ },
    { label: 'Un número (0-9)', regex: /[0-9]/ },
    { label: 'Carácter especial', regex: /[!@#$%^&*(),.?":{}|<>]/ },
];

function PasswordValidator({ password }: { password: string }) {
    const checks = useMemo(
        () => PASSWORD_REQUIREMENTS.map((req) => ({ ...req, isMet: req.regex.test(password) })),
        [password]
    );
    const score = checks.filter((check) => check.isMet).length;
    const isStrong = score === 4;
    const barColor = score <= 2 ? '#ef4444' : score === 3 ? '#fbbf24' : '#ccff00';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 p-4 rounded-2xl bg-[#0d0d0d] border border-white/5"
        >
            <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className={`w-5 h-5 ${isStrong ? 'text-[#ccff00]' : 'text-zinc-500'}`} />
                <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white">Seguridad de tu llave</h4>
            </div>

            <div className="flex gap-1.5 mb-4">
                {[1, 2, 3, 4].map((step) => (
                    <div
                        key={step}
                        className="h-1.5 flex-1 rounded-full transition-all duration-500"
                        style={{ backgroundColor: step <= score ? barColor : '#1a1a1a' }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {checks.map((check, idx) => (
                    <div key={idx} className={`flex items-center gap-2 text-[11px] transition-colors ${check.isMet ? 'text-[#ccff00]' : 'text-gray-600'}`}>
                        <AnimatePresence mode="wait" initial={false}>
                            {check.isMet ? (
                                <motion.span
                                    key="checked"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="inline-flex"
                                >
                                    <CheckCircle2 size={14} className="shrink-0" />
                                </motion.span>
                            ) : (
                                <motion.span key="unchecked" className="inline-flex">
                                    <Circle size={14} className="shrink-0" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <span className={check.isMet ? 'font-bold' : ''}>{check.label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default function LoginPage() {
    const {
        user,
        loading: authLoading,
        profileLoading,
        isAdmin,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        forgotPassword,
        enableDevMode
    } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [designMode, setDesignMode] = useState<'minimal' | 'glass'>('glass');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [passkeySupported, setPasskeySupported] = useState(false);
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [passkeyBurst, setPasskeyBurst] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const [smartConsentAccepted, setSmartConsentAccepted] = useState(false);
    const [smartConsentModalOpen, setSmartConsentModalOpen] = useState(false);
    const [smartConsentSavePending, setSmartConsentSavePending] = useState(false);
    const [smartConsentSaving, setSmartConsentSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            const next = safeInternalNextPath(searchParams.get('next'));
            if (next) {
                router.replace(next);
                return;
            }
            if (isAdmin) {
                router.replace('/admin');
            } else if (!profileLoading) {
                router.replace('/dashboard');
            }
        }
    }, [authLoading, user, profileLoading, isAdmin, router, searchParams]);

    useEffect(() => {
        setPasskeySupported(typeof window !== 'undefined' && 'PublicKeyCredential' in window);
    }, []);

    useEffect(() => {
        if (!passkeyBurst) return;
        const t = window.setTimeout(() => setPasskeyBurst(false), 1100);
        return () => window.clearTimeout(t);
    }, [passkeyBurst]);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            console.error('[Login Google]', err);
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!formData.email) {
            setError('Ingresa tu email para restablecer la contraseña.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await forgotPassword(formData.email);
            setSuccess('Email de recuperación enviado. Revisa tu bandeja de entrada.');
        } catch (err: any) {
            setError('Error al enviar el correo de recuperación.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!isValidEmail(formData.email)) {
            setError('Correo electrónico no válido.');
            return;
        }
        if (isLogin) {
            if (!isValidPassword(formData.password)) {
                setError('Mínimo 6 caracteres en la contraseña.');
                return;
            }
        } else {
            const validation = validateSignupPassword(formData.password);
            if (!validation.valid) {
                setError(validation.error!);
                return;
            }
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmail(formData.email, formData.password);
            } else {
                if (!smartConsentAccepted) {
                    setError('Debes aceptar el Contrato de Adhesión y Exoneración de Responsabilidad.');
                    setLoading(false);
                    return;
                }
                await signUpWithEmail(formData.email, formData.password, formData.name);

                // Persistimos Smart Consent cuando ya existe sesión.
                if (smartConsentAccepted) {
                    setSmartConsentSaving(true);
                    try {
                        let headers = await getAuthHeaders();
                        let tries = 0;
                        while (!headers.Authorization && tries < 6) {
                            await new Promise((r) => setTimeout(r, 250));
                            headers = await getAuthHeaders();
                            tries++;
                        }

                        if (headers.Authorization) {
                            const res = await fetch('/api/legal/accept', {
                                method: 'POST',
                                headers: { ...headers, 'Content-Type': 'application/json' },
                                body: JSON.stringify({}),
                            });
                            setSmartConsentSavePending(!res.ok);
                        } else {
                            setSmartConsentSavePending(true);
                        }
                    } finally {
                        setSmartConsentSaving(false);
                    }
                }
            }
            const next = safeInternalNextPath(searchParams.get('next'));
            if (next) {
                router.push(next);
            } else {
                const shouldGoAdmin = isAdmin || isAdminAccess(undefined, formData.email);
                router.push(shouldGoAdmin ? '/admin' : '/dashboard');
            }
        } catch (err: any) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handlePasskeyLogin = async () => {
        const supabase = getSupabaseClient();
        if (!supabase) {
            setError('Supabase no está configurado.');
            return;
        }
        setPasskeyLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const authAny = supabase.auth as any;
            if (typeof authAny.signInWithPasskey !== 'function') {
                throw new Error('Tu SDK de Supabase no soporta signInWithPasskey en este entorno.');
            }
            const { error: signErr } = await authAny.signInWithPasskey();
            if (signErr) throw signErr;
            setSuccess('Acceso biométrico completado. Ingresando...');
            if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                navigator.vibrate([12, 45, 14]);
            }
            setPasskeyBurst(true);
            const next = safeInternalNextPath(searchParams.get('next'));
            if (next) {
                router.push(next);
            } else if (isAdmin) {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(getAuthErrorMessage(err));
        } finally {
            setPasskeyLoading(false);
        }
    };

    const isGlass = designMode === 'glass';
    const registerPassword = formData.password;
    const isSignupPasswordValid = useMemo(
        () => PASSWORD_REQUIREMENTS.every((rule) => rule.regex.test(formData.password)),
        [formData.password]
    );
    const canSubmitSignup = useMemo(
        () =>
            formData.name.trim().length > 0 &&
            formData.email.trim().length > 0 &&
            isSignupPasswordValid &&
            smartConsentAccepted,
        [formData.name, formData.email, isSignupPasswordValid, smartConsentAccepted]
    );

    if (authLoading) {
        return (
            <div className="h-dvh bg-[#050505] flex items-center justifyCenter">
                <BouncingBall size={40} bounceHeight={2} />
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden px-6 py-12 font-outfit transition-colors duration-500 ${
                isGlass ? 'bg-[#050505]' : 'bg-[#0a0a0a]'
            }`}
        >
            {/* Mini celebración passkey (sin dependencia extra; framer-motion ya está en el proyecto) */}
            <AnimatePresence>
                {passkeyBurst && (
                    <motion.div
                        key="passkey-burst"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center"
                        aria-hidden
                    >
                        {Array.from({ length: 16 }, (_, i) => {
                            const angle = (i / 16) * Math.PI * 2;
                            const dist = 100 + (i % 4) * 18;
                            return (
                                <motion.span
                                    key={i}
                                    className="absolute left-1/2 top-[40%] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-[3px] bg-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.9)]"
                                    initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
                                    animate={{
                                        opacity: 0,
                                        scale: 0.15,
                                        x: Math.cos(angle) * dist,
                                        y: Math.sin(angle) * dist - 55,
                                        rotate: i * 28,
                                    }}
                                    transition={{ duration: 0.88, ease: [0.2, 0.9, 0.2, 1] }}
                                />
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Aura Background solo en modo glass */}
            {isGlass && (
                <div className="absolute inset-0 pointer-events-none">
                    {/* Court Grid Effect */}
                    <div
                        className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage:
                                'linear-gradient(to right, #ccff00 1px, transparent 1px), linear-gradient(to bottom, #ccff00 1px, transparent 1px)',
                            backgroundSize: '60px 60px',
                        }}
                    />

                    {/* Dynamic Glows */}
                    <div
                        className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-padel-primary/10 blur-[150px] rounded-full animate-pulse"
                        style={{ animationDuration: '6s' }}
                    />
                    <div
                        className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse"
                        style={{ animationDuration: '9s', animationDelay: '3s' }}
                    />

                    {/* Centered Focus Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-padel-primary/5 blur-[100px] rounded-full" />
                </div>
            )}

            {/* Botón flotante para cambiar modo de diseño */}
            <button
                type="button"
                onClick={() => setDesignMode((prev) => (prev === 'glass' ? 'minimal' : 'glass'))}
                className="fixed top-4 right-4 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/15 bg-black/70 text-white/70 hover:text-white hover:border-[#ccff00]/80 hover:bg-black/90 shadow-lg shadow-black/60 transition-all"
                aria-label="Cambiar diseño de login"
            >
                <Layout className="w-4 h-4" />
            </button>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 mb-3"
                    >
                        <BouncingBall size={28} bounceHeight={1.4} />
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">
                            SMART <span className="text-padel-primary">PADEL</span>
                        </h1>
                    </motion.div>
                    <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full"
                    >
                        <Shield className="w-3.5 h-3.5 text-padel-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            {isLogin ? 'Sistema de Control de Acceso' : 'Crea tu Cuenta de Administrador'}
                        </span>
                    </motion.div>
                </div>

                {/* Auth Card Container */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`
                        rounded-[2.5rem] overflow-hidden relative border transition-all duration-500
                        ${
                            isGlass
                                ? 'bg-white/5 backdrop-blur-xl border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)]'
                                : 'bg-[#0f0f0f] border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.9)]'
                        }
                    `}
                >
                    {/* Interior Glow */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-padel-primary/30 to-transparent" />

                    <div className="p-8 sm:p-10">
                        {/* Selector Tab - Glowing Text Style */}
                        <div className="flex justify-center gap-12 mb-12 border-b border-white/5 pb-4">
                            <button
                                onClick={() => { setIsLogin(true); setError(null); }}
                                className="relative bg-transparent border-none outline-none cursor-pointer group"
                            >
                                <span className={`text-base font-black tracking-[0.2em] uppercase transition-all duration-500 ${isLogin ? 'text-padel-primary drop-shadow-[0_0_12px_rgba(204,255,0,0.7)]' : 'text-zinc-600 group-hover:text-white'}`}>
                                    Entrar
                                </span>
                                {isLogin && (
                                    <motion.div
                                        layoutId="activeTabUnderline"
                                        className="absolute bottom-[-16px] left-0 right-0 h-[3px] bg-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.6)]"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(null); }}
                                className="relative bg-transparent border-none outline-none cursor-pointer group"
                            >
                                <span className={`text-base font-black tracking-[0.2em] uppercase transition-all duration-500 ${!isLogin ? 'text-padel-primary drop-shadow-[0_0_12px_rgba(204,255,0,0.7)]' : 'text-zinc-600 group-hover:text-white'}`}>
                                    Registro
                                </span>
                                {!isLogin && (
                                    <motion.div
                                        layoutId="activeTabUnderline"
                                        className="absolute bottom-[-16px] left-0 right-0 h-[3px] bg-padel-primary shadow-[0_0_20px_rgba(204,255,0,0.6)]"
                                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <User className="w-full h-full text-padel-primary" />
                                            </div>
                                            <input
                                                required={!isLogin}
                                                type="text"
                                                placeholder="NOMBRE COMPLETO"
                                                className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 text-sm outline-none focus:border-padel-primary/50 transition-all font-bold text-white placeholder:text-zinc-600 tracking-tight normal-case"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                autoCapitalize="words"
                                                autoCorrect="off"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center opacity-40 group-focus-within:opacity-100 transition-opacity">
                                    <Mail className="w-full h-full text-padel-primary" />
                                </div>
                                <input
                                    required
                                    type="email"
                                    placeholder="EMAIL@DOMINIO.COM"
                                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 text-sm outline-none focus:border-padel-primary/50 transition-all font-bold text-white placeholder:text-zinc-600 tracking-tight normal-case"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center opacity-40 group-focus-within:opacity-100 transition-opacity">
                                    <Lock className="w-full h-full text-padel-primary" />
                                </div>
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="CONTRASEÑA"
                                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-14 text-sm outline-none focus:border-padel-primary/50 transition-all font-bold text-white placeholder:text-zinc-600 tracking-tight normal-case"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    autoCapitalize="none"
                                    autoCorrect="off"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-padel-primary transition-colors bg-transparent border-none outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {!isLogin && (
                                <PasswordValidator password={registerPassword} />
                            )}

                            <AnimatePresence>
                                {(error || success) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`flex items-start gap-3 p-4 rounded-2xl mt-2 border ${error ? 'bg-red-500/10 border-red-500/20' : 'bg-padel-primary/10 border-padel-primary/20'}`}>
                                            {error ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-padel-primary shrink-0 mt-0.5" />}
                                            <p className={`text-[10px] font-black uppercase tracking-tight ${error ? 'text-red-300' : 'text-padel-primary'}`}>{error || success}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isLogin && (
                                <div className="mt-1">
                                    <label className="flex items-start gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={smartConsentAccepted}
                                            onChange={(e) => {
                                                if (!e.target.checked) {
                                                    setSmartConsentAccepted(false);
                                                    setSmartConsentSavePending(false);
                                                    return;
                                                }
                                                setSmartConsentModalOpen(true);
                                            }}
                                            className="mt-1 w-5 h-5 rounded border-2 border-white/10 accent-[#ccff00]"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-xs text-white/90 leading-snug font-normal">
                                                Declaro haber leido, comprendido y aceptado los <span className="underline">Términos y Condiciones</span> y la <span className="underline">Politica de Privacidad</span>.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setSmartConsentModalOpen(true)}
                                                className="mt-1 text-[11px] font-black uppercase tracking-widest text-padel-primary/90 hover:underline"
                                            >
                                                Ver contrato
                                            </button>
                                            {smartConsentSavePending && (
                                                <p className="mt-1 text-[11px] text-amber-300/90">
                                                    Guardado pendiente: se completará al iniciar sesión.
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            )}

                            <button
                                disabled={loading || (!isLogin && !canSubmitSignup)}
                                type="submit"
                                className={`w-full py-6 font-black uppercase text-lg transition-all flex items-center justify-center disabled:opacity-50 mt-10 group relative outline-none cursor-pointer ${
                                    isGlass
                                        ? 'bg-transparent text-padel-primary'
                                        : 'bg-white text-black rounded-2xl'
                                }`}
                            >
                                <div
                                    className={`transition-all duration-300 ${
                                        loading
                                            ? 'opacity-50'
                                            : isGlass
                                            ? 'group-hover:scale-110 group-active:scale-95 drop-shadow-[0_0_15px_rgba(204,255,0,0.8)] focus:drop-shadow-[0_0_20px_rgba(204,255,0,1)]'
                                            : 'group-hover:scale-105 group-active:scale-95'
                                    }`}
                                >
                                    {loading ? (
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <span className="tracking-[0.2em]">
                                            {isLogin ? 'ENTRAR AHORA' : 'CREAR CUENTA'}
                                        </span>
                                    )}
                                </div>
                                {isGlass && (
                                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-padel-primary/40 scale-x-0 group-hover:scale-x-50 group-focus:scale-x-100 transition-transform duration-500 shadow-[0_0_15px_#ccff00]" />
                                )}
                            </button>

                            {isLogin && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-[10px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] transition-colors bg-transparent border-none p-0 outline-none cursor-pointer"
                                    >
                                        ¿No recuerdas la contraseña?
                                    </button>
                                </div>
                            )}

                            {/* FaceID / TouchID: oculto por solicitud */}
                        </form>

                    </div>
                </motion.div>

                <LegalModal
                    open={smartConsentModalOpen}
                    onClose={() => setSmartConsentModalOpen(false)}
                    loading={smartConsentSaving}
                    onAccept={async () => {
                        // Marcamos intención (checkbox) y tratamos de persistir si hay sesión disponible.
                        // En el signup suele existir sesión justo después del registro, y en caso contrario
                        // dejamos reintento/persistencia para el submit.
                        setSmartConsentAccepted(true);
                        setSmartConsentModalOpen(false);

                        try {
                            const headers = await getAuthHeaders();
                            if (!headers.Authorization) {
                                setSmartConsentSavePending(true);
                                return;
                            }
                            const res = await fetch('/api/legal/accept', {
                                method: 'POST',
                                headers: { ...headers, 'Content-Type': 'application/json' },
                                body: JSON.stringify({}),
                            });
                            if (!res.ok) {
                                setSmartConsentSavePending(true);
                            } else {
                                setSmartConsentSavePending(false);
                            }
                        } catch {
                            setSmartConsentSavePending(true);
                        }
                    }}
                />

                {/* Footer Controls (Simplificado / Oculto) */}
                <div className="mt-8 flex flex-col items-center gap-6">
                    <button
                        onClick={() => {
                            enableDevMode();
                            router.push('/tournaments');
                        }}
                        className="flex items-center gap-2 text-[9px] font-black text-padel-primary/10 hover:text-padel-primary uppercase tracking-[0.3em] transition-all bg-transparent border-none p-0 outline-none"
                    >
                        <Zap className="w-3 h-3" /> Sandbox Node
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
