'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, RefreshCw, CheckCircle2, AlertCircle, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { user, logout, signInWithEmail, signUpWithEmail, enableDevMode } = useAuth();
    const router = useRouter();

    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '', name: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await signInWithEmail(formData.email, formData.password);
            } else {
                await signUpWithEmail(formData.email, formData.password, formData.name);
            }
            router.push('/tournaments');
        } catch (err: any) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Email o contraseña incorrectos.');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('El email ya está registrado.');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña debe tener al menos 6 caracteres.');
            } else {
                setError('Error en la autenticación. Revisa tu conexión.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDevMode = () => {
        enableDevMode();
        router.push('/tournaments');
    };

    return (
        <div className="h-dvh bg-[#0a0a0a] text-white flex flex-col items-center justify-center relative overflow-hidden px-5">

            {/* Fondo ambiental */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-padel-primary/10 blur-[160px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-padel-primary/5 blur-[130px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 w-full max-w-sm flex flex-col items-center gap-4"
            >
                {/* ── LOGO ── */}
                <div className="flex flex-col items-center gap-2">
                    {/* Pelota rebotando */}
                    <div className="flex flex-col items-center">
                        <motion.div
                            animate={{ y: [0, -28, 0], scaleY: [1, 0.85, 1], scaleX: [1, 1.1, 1] }}
                            transition={{ duration: 0.72, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                            className="w-9 h-9 bg-padel-primary rounded-full relative overflow-hidden"
                            style={{ boxShadow: '0 5px 22px rgba(204,255,0,0.5), 0 2px 6px rgba(204,255,0,0.2)' }}
                        >
                            <div className="absolute inset-0 rounded-full border-2 border-black/15 scale-x-110 -translate-x-1" />
                            <div className="absolute inset-0 rounded-full border-2 border-black/15 scale-x-110 translate-x-2 translate-y-2" />
                            <div className="absolute top-1 left-1.5 w-2.5 h-2.5 bg-white/40 rounded-full blur-sm" />
                        </motion.div>
                        <motion.div
                            animate={{ scaleX: [1, 1.6, 1], opacity: [0.45, 0.15, 0.45] }}
                            transition={{ duration: 0.72, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                            className="w-6 h-1.5 bg-padel-primary/30 rounded-full blur-md mt-0.5"
                        />
                    </div>

                    {/* Texto */}
                    <h1
                        className="text-4xl font-black italic tracking-tighter uppercase leading-none select-none"
                        style={{ textShadow: '0 4px 30px rgba(204,255,0,0.12)' }}
                    >
                        SMART{' '}
                        <span
                            className="text-padel-primary"
                            style={{ textShadow: '0 0 40px rgba(204,255,0,0.45), 0 4px 20px rgba(204,255,0,0.25)' }}
                        >
                            PADEL
                        </span>
                    </h1>

                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.22em]">
                        Gestión Profesional de Torneos
                    </p>
                </div>

                {/* ── Si el usuario YA está loggeado ── */}
                {user ? (
                    <div className="w-full glass rounded-2xl p-5 border border-white/5 flex flex-col items-center gap-3">
                        {user.photoURL ? (
                            <img src={user.photoURL} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-padel-primary/40" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-padel-primary flex items-center justify-center text-black text-xl font-black">
                                {user.displayName?.charAt(0) || 'U'}
                            </div>
                        )}
                        <div className="text-center">
                            <p className="font-black text-white">{user.displayName || user.email}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">{user.email}</p>
                        </div>
                        <button
                            onClick={() => router.push('/tournaments')}
                            className="w-full bg-padel-primary text-black font-black uppercase italic py-3 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-padel-primary/20 text-sm"
                        >
                            Ir al Panel <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={logout}
                            className="text-[10px] font-black text-gray-700 hover:text-red-400 uppercase tracking-widest transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                ) : (
                    /* ── FORMULARIO LOGIN / REGISTRO ── */
                    <div className="w-full glass rounded-2xl p-5 border border-white/5 shadow-2xl">

                        {/* Toggle */}
                        <div className="flex bg-white/5 p-1 rounded-xl mb-4 border border-white/5">
                            <button
                                onClick={() => { setIsLogin(true); setError(null); }}
                                className={`flex-1 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${isLogin ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => { setIsLogin(false); setError(null); }}
                                className={`flex-1 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all ${!isLogin ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                            >
                                Crear Cuenta
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            {/* Nombre — solo en registro */}
                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="relative">
                                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                            <input
                                                required={!isLogin}
                                                type="text"
                                                placeholder="Nombre completo"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-padel-primary/50 transition-colors font-bold text-white placeholder:text-gray-700"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email */}
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                <input
                                    required
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-padel-primary/50 transition-colors font-bold text-white placeholder:text-gray-700"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Contraseña */}
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                <input
                                    required
                                    type="password"
                                    placeholder="Contraseña"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-padel-primary/50 transition-colors font-bold text-white placeholder:text-gray-700"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="flex items-center gap-2 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl"
                                    >
                                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                        <p className="text-[11px] text-red-300 font-medium">{error}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-padel-primary text-black py-3 rounded-xl font-black uppercase italic text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-padel-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading
                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                    : <CheckCircle2 className="w-4 h-4" />
                                }
                                {isLogin ? 'Entrar Ahora' : 'Crear mi Cuenta'}
                            </button>
                        </form>

                        {/* Divisor */}
                        <div className="relative my-3.5">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-[#111] px-3 text-[9px] font-black uppercase tracking-[0.2em] text-gray-800">desarrollo</span>
                            </div>
                        </div>

                        {/* Botón de simulación */}
                        <button
                            onClick={handleDevMode}
                            className="w-full flex items-center justify-center gap-2 border border-padel-primary/20 bg-padel-primary/5 hover:bg-padel-primary/10 text-padel-primary py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all hover:border-padel-primary/40 group"
                        >
                            <Zap className="w-3.5 h-3.5 group-hover:animate-pulse" />
                            Simulación de Ingreso Rápido
                        </button>
                    </div>
                )}

                <p className="text-[9px] text-gray-800 font-medium text-center max-w-xs leading-relaxed">
                    Al continuar, aceptas nuestros términos de servicio y política de privacidad.
                </p>
            </motion.div>
        </div>
    );
}
