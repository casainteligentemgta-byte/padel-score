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
        if (!authLoading && user && !profileLoading) {
            if (isAdmin) {
                router.replace('/admin');
            } else {
                router.replace('/tournaments');
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
                router.push('/tournaments');
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
                        {/* Selector Tab */}
                        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 relative h-14">
                            <motion.div
                                layout
                                className="absolute inset-1.5 bg-padel-primary rounded-xl"
                                initial={false}
                                animate={{ x: isLogin ? 0 : '100%' }}
                                style={{ width: 'calc(50% - 6px)' }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                            <button
                                onClick={() => { setIsLogin(true); setError(null); }}
                                className={`flex-1 relative z-10 font-black uppercase text-[10px] tracking-widest transition-colors duration-300 ${isLogin ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(null); }}
                                className={`flex-1 relative z-10 font-black uppercase text-[10px] tracking-widest transition-colors duration-300 ${!isLogin ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                Registro
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
                                                className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 text-sm outline-none focus:border-padel-primary/50 transition-all font-bold text-white placeholder:text-zinc-600 uppercase tracking-tight"
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
                                    placeholder="EMAIL@DOMINIO.COM"
                                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-6 text-sm outline-none focus:border-padel-primary/50 transition-all font-bold text-white placeholder:text-zinc-600 uppercase tracking-tight"
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
                                    className="w-full h-16 bg-white/[0.03] border border-white/10 rounded-2xl pl-16 pr-14 text-sm outline-none focus:border-padel-primary/50 transition-all font-bold text-white placeholder:text-zinc-600 tracking-tight"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-padel-primary transition-colors"
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
                                className="w-full h-16 bg-padel-primary text-black rounded-2xl font-black uppercase italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgba(204,255,0,0.15)] flex items-center justify-center gap-3 disabled:opacity-50 mt-6 group overflow-hidden relative"
                            >
                                <motion.div className="relative z-10 flex items-center gap-2">
                                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                        <>
                                            <span>{isLogin ? 'Entrar Ahora' : 'Crear Cuenta'}</span>
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.div>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-[85%] transition-transform duration-500" />
                            </button>
                        </form>

                        <div className="relative my-10 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <span className="relative px-4 bg-zinc-900/60 inline-block text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Alternativas</span>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full h-16 bg-white/[0.03] border border-white/10 text-white rounded-2xl font-black uppercase italic text-xs hover:bg-white/[0.05] hover:border-white/20 transition-all flex items-center justify-center gap-4 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Chrome className="w-4 h-4" />
                            </div>
                            Google Workspace
                        </button>
                    </div>
                </motion.div>

                {/* Footer Controls */}
                <div className="mt-8 flex flex-col items-center gap-6">
                    {isLogin && (
                        <button
                            onClick={handleForgotPassword}
                            className="text-[9px] font-black text-zinc-500 hover:text-padel-primary uppercase tracking-[0.2em] transition-colors"
                        >
                            ¿No recuerdas la contraseña?
                        </button>
                    )}

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => {
                                enableDevMode();
                                router.push('/tournaments');
                            }}
                            className="flex items-center gap-2 text-[9px] font-black text-padel-primary/30 hover:text-padel-primary uppercase tracking-[0.3em] transition-all"
                        >
                            <Zap className="w-3 h-3" /> Sandbox Node
                        </button>

                        <div className="w-[1px] h-3 bg-white/10" />

                        <Link
                            href="/"
                            className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.3em] transition-colors"
                        >
                            Inicio
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
