'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogIn,
    Mail,
    Lock,
    Chrome,
    ArrowRight,
    User,
    AlertCircle,
    CheckCircle2,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
            router.push('/');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/unauthorized-domain') {
                setError('Google Sign-In requiere configuración de dominio o deploy. Prueba con Email/Contraseña o el Modo Simulación en local.');
            } else {
                setError('Error al conectar con Google. Por favor intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

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
            router.push('/');
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/configuration-not-found') {
                setError('El servicio de Autenticación no está activado en tu proyecto de Firebase. Por favor, actívalo en la Consola de Firebase > Authentication > Sign-in method.');
            } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Credenciales incorrectas.');
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

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 font-outfit relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-padel-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block mb-6">
                        <div className="w-16 h-16 bg-padel-primary rounded-2xl flex items-center justify-center rotate-3 shadow-2xl shadow-padel-primary/40">
                            <ShieldCheck className="w-10 h-10 text-black" />
                        </div>
                    </Link>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                        {isLogin ? 'Bienvenido de ' : 'Únete a '}
                        <span className="text-padel-primary">Padel Score</span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">
                        {isLogin ? 'Accede a tu panel de gestión deportiva.' : 'Comienza a organizar tus torneos hoy mismo.'}
                    </p>
                </div>

                <div className="glass rounded-[2.5rem] p-8 md:p-10 border-white/10 shadow-2xl relative">
                    {/* Toggle */}
                    <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${isLogin ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${!isLogin ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            Crear Cuenta
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence mode='wait'>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Nombre</label>
                                    <div className="relative">
                                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            required={!isLogin}
                                            type="text"
                                            placeholder="Tu nombre completo"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-padel-primary/50 transition-colors font-bold text-white"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    required
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-padel-primary/50 transition-colors font-bold text-white"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end mr-4">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Contraseña</label>
                                {isLogin && (
                                    <button type="button" className="text-[9px] font-black text-gray-600 hover:text-padel-primary uppercase tracking-widest">
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-padel-primary/50 transition-colors font-bold text-white"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-red-200/80 font-medium leading-relaxed">{error}</p>
                            </motion.div>
                        )}

                        <button
                            disabled={loading}
                            type="submit"
                            className="w-full bg-padel-primary text-black py-4 rounded-2xl font-black uppercase italic text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-padel-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {isLogin ? 'Entrar Ahora' : 'Crear mi Cuenta'}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                        <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-700">
                            <span className="bg-[#111] px-4">O continúa con</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white/5 border border-white/10 text-white py-4 rounded-2xl font-black uppercase italic text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-3 relative group"
                    >
                        <Chrome className="w-5 h-5 absolute left-6 group-hover:scale-110 transition-transform" />
                        Google Cloud
                    </button>
                </div>

                <div className="mt-12 text-center space-y-4">
                    <p className="text-xs text-gray-700 font-bold uppercase tracking-widest">
                        ¿Problemas persistentes?
                        <button
                            onClick={() => (window as any).enableDevMode?.()}
                            className="text-padel-primary hover:underline ml-2"
                        >
                            Simular Sesión (Dev)
                        </button>
                    </p>
                    <p className="text-[10px] text-gray-800 font-medium max-w-xs mx-auto">
                        Al continuar, aceptas nuestros términos de servicio y política de privacidad de datos deportivos.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
