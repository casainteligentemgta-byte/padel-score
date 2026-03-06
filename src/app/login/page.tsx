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
    EyeOff
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isValidEmail, isValidPassword } from '@/lib/authValidators';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { user, loading: authLoading, signInWithGoogle, signInWithEmail, signUpWithEmail, forgotPassword, enableDevMode } = useAuth();
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
        if (!authLoading && user) router.replace('/tournaments');
    }, [authLoading, user, router]);

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
            router.push('/tournaments');
        } catch (err: any) {
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="h-dvh bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-dvh bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-5 font-outfit">

            {/* Ultra-Premium Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-padel-primary/10 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[130px] rounded-full animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center gap-4 mb-2">
                    <Link href="/" className="flex flex-col items-center">
                        <motion.div
                            animate={{
                                y: [0, -25, 0],
                                scaleY: [1, 0.8, 1],
                                scaleX: [1, 1.1, 1]
                            }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-12 h-12 bg-padel-primary rounded-full relative overflow-hidden flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.3)]"
                        >
                            <div className="absolute inset-0 rounded-full border-[2px] border-black/10 scale-110 -translate-x-1" />
                            <div className="absolute inset-0 rounded-full border-[2px] border-black/10 scale-110 translate-x-2 translate-y-2" />
                        </motion.div>
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase mt-4">
                            SMART <span className="text-padel-primary">PADEL</span>
                        </h1>
                    </Link>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.4em] opacity-50">
                        {isLogin ? 'Acceso a la plataforma' : 'Regístrate en el sistema'}
                    </p>
                </div>

                {/* Main Auth Card */}
                <div className="w-full glass rounded-[2.5rem] p-8 border border-white/10 shadow-3xl backdrop-blur-3xl bg-white/[0.02]">

                    {/* Form Type Switcher */}
                    <div className="flex bg-black/40 p-1 rounded-2xl mb-8 border border-white/5 relative">
                        <div
                            className={`absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-padel-primary rounded-xl transition-all duration-500 ease-[0.16, 1, 0.3, 1] ${isLogin ? 'left-[4px]' : 'left-[calc(50%)]'}`}
                        />
                        <button
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={`flex-1 py-3.5 relative z-10 font-black uppercase text-[10px] tracking-widest transition-colors duration-300 ${isLogin ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={`flex-1 py-3.5 relative z-10 font-black uppercase text-[10px] tracking-widest transition-colors duration-300 ${!isLogin ? 'text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Registro
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2"
                                >
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-padel-primary transition-colors" />
                                        <input
                                            required={!isLogin}
                                            type="text"
                                            placeholder="NOMBRE COMPLETO"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none focus:border-padel-primary/40 transition-all font-bold text-white placeholder:text-gray-700 uppercase italic tracking-tight"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-padel-primary transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="EMAIL@SISTEMA.COM"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none focus:border-padel-primary/40 transition-all font-bold text-white placeholder:text-gray-700 uppercase tracking-tight"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-padel-primary transition-colors" />
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña (distingue mayúsculas y minúsculas)"
                                    autoCapitalize="off"
                                    autoComplete="current-password"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-sm outline-none focus:border-padel-primary/40 transition-all font-bold text-white placeholder:text-gray-600"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-padel-primary transition-colors"
                                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                            >
                                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-red-200 font-bold uppercase tracking-tight">{error}</p>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-start gap-3 p-4 bg-padel-primary/10 border border-padel-primary/20 rounded-2xl"
                            >
                                <CheckCircle2 className="w-4 h-4 text-padel-primary shrink-0 mt-0.5" />
                                <p className="text-[10px] text-padel-primary font-bold uppercase tracking-tight">{success}</p>
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-padel-primary text-black py-4 mt-4 rounded-2xl font-black uppercase italic text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_15px_30px_rgba(204,255,0,0.2)] flex items-center justify-center gap-3 disabled:opacity-50 group"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <span>{isLogin ? 'Entrar Ahora' : 'Crear Perfil'}</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/5" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-[#0c0c0c] px-4 text-[9px] font-black uppercase tracking-[0.3em] text-gray-800">Redes Sociales</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase italic text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3 relative group"
                    >
                        <Chrome className="w-5 h-5 absolute left-6 group-hover:scale-110 transition-transform" />
                        Google Auth
                    </button>
                </div>

                {isLogin && (
                    <button
                        onClick={handleForgotPassword}
                        className="text-[10px] font-black text-gray-600 hover:text-padel-primary uppercase tracking-widest transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>
                )}

                <div className="mt-4 flex flex-col items-center gap-4">
                    <button
                        onClick={() => {
                            enableDevMode();
                            router.push('/tournaments');
                        }}
                        className="flex items-center gap-2 text-[10px] font-black text-padel-primary/50 hover:text-padel-primary uppercase tracking-[0.2em] transition-all"
                    >
                        <Zap className="w-3 h-3" /> Sandbox Mode
                    </button>
                </div>
            </motion.div>

            <style jsx global>{`
                .glass { 
                    background: rgba(255, 255, 255, 0.02); 
                    backdrop-filter: blur(28px); 
                    -webkit-backdrop-filter: blur(28px); 
                }
            `}</style>
        </div>
    );
}
