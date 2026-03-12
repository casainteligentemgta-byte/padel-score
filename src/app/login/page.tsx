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
import { isValidEmail, isValidPassword } from '@/lib/authValidators';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import BouncingBall from '@/components/BouncingBall';

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

    useEffect(() => {
        if (!authLoading && user) {
            if (isAdmin) {
                router.replace('/admin');
            } else if (!profileLoading) {
                router.replace('/hub');
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
        if (!isValidPassword(formData.password)) {
            setError('Mínimo 6 caracteres en la contraseña.');
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmail(formData.email, formData.password);
            } else {
                await signUpWithEmail(formData.email, formData.password, formData.name);
            }
            if (isAdmin) {
                router.push('/admin');
            } else {
                router.push('/hub');
            }
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
                {/* Court Grid Effect */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ccff00 1px, transparent 1px), linear-gradient(to bottom, #ccff00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Dynamic Glows */}
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-padel-primary/10 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />

                {/* Centered Focus Glow */}
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
                    className="bg-zinc-900/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative"
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

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full py-6 bg-transparent text-padel-primary font-black uppercase text-lg transition-all flex items-center justify-center disabled:opacity-50 mt-10 group relative outline-none border-none cursor-pointer"
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
                </motion.div>

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
