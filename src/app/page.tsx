'use client';

import { useState, useEffect } from 'react';
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
    Shield
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isValidEmail, isValidPassword, validateSignupPassword } from '@/lib/authValidators';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';
import { useRouter } from 'next/navigation';
import BouncingBall from '@/components/BouncingBall';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { isAdminAccess } from '@/lib/adminAccess';
import LegalModal from '@/components/legal/LegalModal';
import { getAuthHeaders } from '@/lib/apiAuth';

export default function HomePage() {
    const { user, isAdmin, loading: authLoading, profileLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, forgotPassword, enableDevMode } = useAuth();
    const { clubName } = useAppSettings();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const [smartConsentAccepted, setSmartConsentAccepted] = useState(false);
    const [smartConsentModalOpen, setSmartConsentModalOpen] = useState(false);
    const [smartConsentSaving, setSmartConsentSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && user) {
            if (isAdmin) {
                router.replace('/admin');
            } else if (!profileLoading) {
                router.replace('/dashboard');
            }
        }
    }, [authLoading, user, profileLoading, isAdmin, router]);

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
                    setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad.');
                    setLoading(false);
                    return;
                }
                await signUpWithEmail(formData.email, formData.password, formData.name);

                // Persistimos el consentimiento legal
                try {
                    let headers = await getAuthHeaders();
                    let tries = 0;
                    while (!headers.Authorization && tries < 6) {
                        await new Promise((r) => setTimeout(r, 250));
                        headers = await getAuthHeaders();
                        tries++;
                    }

                    if (headers.Authorization) {
                        await fetch('/api/legal/accept', {
                            method: 'POST',
                            headers: { ...headers, 'Content-Type': 'application/json' },
                            body: JSON.stringify({}),
                        });
                    }
                } catch (e) {
                    console.error('Error persisting legal consent:', e);
                }
            }
            const shouldGoAdmin = isAdmin || isAdminAccess(undefined, formData.email);
            router.push(shouldGoAdmin ? '/admin' : '/dashboard');

        } catch (err: any) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="h-dvh bg-[#050505] flex items-center justify-center">
                <BouncingBall size={40} bounceHeight={2} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-6 py-12 font-outfit">

            {/* Grid Aura Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ccff00 1px, transparent 1px), linear-gradient(to bottom, #ccff00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-padel-primary/10 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-padel-primary/5 blur-[100px] rounded-full" />
            </div>

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
                        className="flex items-center gap-4"
                    >
                        <BouncingBall size={28} bounceHeight={1.4} />
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase text-white">
                            SMART <span className="text-padel-primary">PADEL</span>
                        </h1>
                    </motion.div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-padel-primary text-black">
                            <Shield className="w-3 h-3" />
                        </span>
                        <span>Smart Padel Experience</span>
                    </div>
                </div>

                {/* Auth Card Container - Now Transparent to remove 'rectangulo blanco' perception */}
                <div className="w-full">
                    <div className="p-0">
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

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="relative group mb-4">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <User className="w-full h-full text-padel-primary" />
                                            </div>
                                            <input
                                                required={!isLogin}
                                                type="text"
                                                placeholder="NOMBRE COMPLETO"
                                                className="w-full h-16 bg-transparent border border-white/10 rounded-full pl-16 pr-6 text-sm outline-none focus:border-padel-primary/40 focus:bg-white/[0.02] transition-all font-bold text-white placeholder:text-zinc-700 tracking-wider"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                                    placeholder="CORREO ELECTRÓNICO"
                                    className="w-full h-16 bg-transparent border border-white/10 rounded-full pl-16 pr-6 text-sm outline-none focus:border-padel-primary/40 focus:bg-white/[0.02] transition-all font-bold text-white placeholder:text-zinc-700 tracking-wider"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                                    className="w-full h-16 bg-transparent border border-white/10 rounded-full pl-16 pr-14 text-sm outline-none focus:border-padel-primary/40 focus:bg-white/[0.02] transition-all font-bold text-white placeholder:text-zinc-700 tracking-wider"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-7 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-padel-primary transition-colors bg-transparent border-none p-0 outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {(error || success) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className={`flex items-start gap-3 p-4 rounded-3xl border ${error ? 'bg-red-500/5 border-red-500/10' : 'bg-padel-primary/5 border-padel-primary/10'}`}>
                                            {error ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 text-padel-primary shrink-0 mt-0.5" />}
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${error ? 'text-red-400' : 'text-padel-primary'}`}>{error || success}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!isLogin && (
                                <div className="mt-2 px-2">
                                    <label className="flex items-start gap-3 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={smartConsentAccepted}
                                            onChange={(e) => {
                                                if (!e.target.checked) {
                                                    setSmartConsentAccepted(false);
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
                                        </div>
                                    </label>
                                </div>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-6 bg-transparent text-padel-primary font-black uppercase text-lg transition-all flex items-center justify-center disabled:opacity-50 mt-8 group relative outline-none border-none cursor-pointer"
                            >
                                <div className={`transition-all duration-300 ${loading ? 'opacity-50' : 'group-hover:scale-110 group-active:scale-95 drop-shadow-[0_0_15px_rgba(204,255,0,0.8)] focus:drop-shadow-[0_0_20px_rgba(204,255,0,1)]'}`}>
                                    {loading ? (
                                        <RefreshCw className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <span className="tracking-[0.2em]">{isLogin ? 'ENTRAR AHORA' : 'CREAR CUENTA'}</span>
                                    )}
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-[2px] bg-padel-primary/40 scale-x-0 group-hover:scale-x-50 group-focus:scale-x-100 transition-transform duration-500 shadow-[0_0_15px_#ccff00]" />
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
                        </form>

                    </div>
                </div>

                {/* Footer Controls (Simplificado / Oculto) */}
                <div className="mt-16 flex flex-col items-center">
                    <button
                        onClick={() => {
                            enableDevMode();
                            router.push('/tournaments');
                        }}
                        className="flex items-center gap-2 text-[9px] font-bold text-white/5 hover:text-white/20 uppercase tracking-[0.4em] transition-all bg-transparent border-none p-0 outline-none"
                    >
                        <Zap className="w-3 h-3" /> Sandbox Mode
                    </button>
                </div>
            </motion.div>

            <LegalModal
                open={smartConsentModalOpen}
                onClose={() => setSmartConsentModalOpen(false)}
                loading={smartConsentSaving}
                onAccept={() => {
                    setSmartConsentAccepted(true);
                    setSmartConsentModalOpen(false);
                }}
            />
        </div>
    );
}
