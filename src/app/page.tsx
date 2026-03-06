'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, RefreshCw, AlertCircle, ChevronRight, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAuthErrorMessage } from '@/lib/authErrorMessages';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
    const { user, logout, loading: authLoading, signInWithEmail, signUpWithEmail, enableDevMode } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && user) router.replace('/tournaments');
    }, [authLoading, user, router]);

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
            setError(getAuthErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="h-dvh bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-dvh bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden font-outfit">

            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-padel-primary/10 blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md px-6"
            >
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-16 h-16 bg-padel-primary rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(204,255,0,0.3)] rotate-3"
                    >
                        <ShieldCheck className="w-9 h-9 text-black" />
                    </motion.div>

                    <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">
                        PADEL <span className="text-padel-primary">SMART</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 italic">
                        The Professional Scoreboard
                    </p>
                </div>

                {user ? (
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-padel-primary/20 to-black border border-padel-primary/30 flex items-center justify-center font-black text-2xl text-padel-primary mb-6">
                            {user.displayName?.[0] || 'U'}
                        </div>
                        <h3 className="text-xl font-black uppercase italic mb-8">{user.displayName || 'Bienvenido'}</h3>

                        <div className="w-full space-y-4">
                            <button
                                onClick={() => router.push('/tournaments')}
                                className="w-full bg-padel-primary text-black font-black uppercase italic py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                            >
                                Ingresar al Sistema <ChevronRight className="w-5 h-5" />
                            </button>
                            <button onClick={logout} className="w-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-red-500 transition-colors py-4">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-3xl">
                        {/* Tab Switcher */}
                        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-8 border border-white/5 relative">
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-y-1.5 left-1.5 w-[calc(50%-6px)] bg-padel-primary rounded-[0.8rem]"
                                animate={{ x: isLogin ? 0 : '100%' }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-3 relative z-10 font-black uppercase text-[10px] tracking-widest transition-colors ${isLogin ? 'text-black' : 'text-gray-500'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-3 relative z-10 font-black uppercase text-[10px] tracking-widest transition-colors ${!isLogin ? 'text-black' : 'text-gray-500'}`}
                            >
                                Registro
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-padel-primary transition-colors" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="NOMBRE"
                                        className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-tight outline-none focus:border-padel-primary/30 text-white placeholder:text-gray-700 transition-all"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            )}

                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-padel-primary transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="EMAIL@SISTEMA.COM"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-tight outline-none focus:border-padel-primary/30 text-white placeholder:text-gray-700 transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-padel-primary transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="CONTRASEÑA"
                                    className="w-full bg-white/[0.05] border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold uppercase tracking-[0.3em] outline-none focus:border-padel-primary/30 text-white placeholder:text-gray-700 transition-all"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                    <p className="text-[10px] text-red-200 font-bold uppercase tracking-tight leading-none">{error}</p>
                                </motion.div>
                            )}

                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-padel-primary text-black font-black uppercase italic py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 mt-4 overflow-hidden relative group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isLogin ? 'Acceder' : 'Registrarse')}
                                {!loading && <ChevronRight className="w-5 h-5" />}
                            </button>
                        </form>

                        {/* Hidden Dev Trigger */}
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                            <button
                                onClick={enableDevMode}
                                className="p-3 text-gray-800 hover:text-padel-primary/40 transition-colors opacity-20 hover:opacity-100"
                                title="Dev Access"
                            >
                                <Zap size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Footer Tag */}
            <div className="mt-12 opacity-20 flex flex-col items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.5em]">Optimized for Pro Devices</span>
                <div className="flex gap-4">
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                    <div className="w-1 h-1 bg-white rounded-full" />
                </div>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
