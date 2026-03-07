'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import {
    Trophy, Users, Settings, Radio, Sparkles,
    DollarSign, Receipt, Brain, Megaphone,
    ShieldCheck, Calendar, Activity, Layout,
    UserCircle, ChevronRight, Play, ExternalLink
} from 'lucide-react';

export default function HomePage() {
    const { isAdmin, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div
                style={{
                    minHeight: '100dvh',
                    background: '#050505',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 24,
                    padding: 24,
                    fontFamily: 'system-ui, sans-serif',
                }}
            >
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-padel-primary/10 blur-[130px] rounded-full animate-pulse" />
                </div>

                <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, position: 'relative' }}>
                    PADEL <span style={{ color: '#ccff00' }}>SMART</span>
                </h1>
                <p style={{ fontSize: 14, color: '#888', margin: 0, position: 'relative' }}>The Professional Scoreboard</p>
                <div style={{ display: 'flex', gap: 16, marginTop: 16, position: 'relative' }}>
                    <Link
                        href={user ? "/tournaments" : "/login"}
                        style={{
                            display: 'inline-block',
                            padding: '14px 28px',
                            background: '#ccff00',
                            color: '#000',
                            fontWeight: 700,
                            textDecoration: 'none',
                            borderRadius: 12,
                        }}
                    >
                        {user ? 'Mis Torneos' : 'Entrar'}
                    </Link>
                    <Link
                        href="/tournaments"
                        style={{
                            display: 'inline-block',
                            padding: '14px 28px',
                            background: 'rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontWeight: 700,
                            textDecoration: 'none',
                            borderRadius: 12,
                            border: '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        Ver Torneos
                    </Link>
                </div>
            </div>
        );
    }

    // --- ADMIN HUB VIEW ---
    const adminCards = [
        { name: 'Torneos', href: '/tournaments', icon: Trophy, color: 'from-padel-primary/20', desc: 'Gestión de categorías y llaves' },
        { name: 'Generador Maestro', href: '/admin/master-generator', icon: Sparkles, color: 'from-blue-500/20', desc: 'Creación inteligente de fixtures' },
        { name: 'En Vivo', href: '/live', icon: Radio, color: 'from-red-500/20', desc: 'Marcadores en tiempo real' },
        { name: 'Ranking', href: '/ranking', icon: Activity, color: 'from-emerald-500/20', desc: 'Estadísticas y puntuaciones' },
        { name: 'Validación de Pagos', href: '/admin/validacion-pagos', icon: Receipt, color: 'from-yellow-500/20', desc: 'Control de inscripciones' },
        { name: 'Publicidad', href: '/admin/publicidad', icon: Megaphone, color: 'from-purple-500/20', desc: 'Banners y patrocinios' },
        { name: 'Gastos', href: '/expenses', icon: DollarSign, color: 'from-rose-500/20', desc: 'Administración financiera' },
        { name: 'Jugadores', href: '/players', icon: Users, color: 'from-cyan-500/20', desc: 'Base de datos de participantes' },
        { name: 'Control de Marcadores', href: '/admin/boards', icon: Layout, color: 'from-indigo-500/20', desc: 'Pizarras y televisores' },
        { name: 'Agentes AI', href: '/agents', icon: Brain, color: 'from-pink-500/20', desc: 'Asistencia automatizada' },
        { name: 'Configuración', href: '/admin/settings', icon: Settings, color: 'from-gray-500/20', desc: 'Ajustes del sistema' },
        { name: 'Mi Cuenta', href: '/mi-cuenta', icon: UserCircle, color: 'from-white/10', desc: 'Perfil del administrador' },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-outfit relative selection:bg-padel-primary selection:text-black shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
            {/* Ambient Lighting */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-padel-primary/10 blur-[140px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                {/* Upper Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-padel-primary italic mb-2">Master Control Unit</h4>
                        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
                            PADEL<span className="text-padel-primary">SMART</span><span className="text-white/20 ml-4 font-normal not-italic">HUB</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-padel-primary" /> Acceso de Super Administrador con privilegios totales
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-6 p-1.5 bg-white/[0.03] border border-white/5 rounded-[2rem] backdrop-blur-3xl"
                    >
                        <div className="pl-6 pr-2">
                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Sesión Activa</p>
                            <p className="text-xs font-black uppercase italic text-white tracking-tight">{user?.email}</p>
                        </div>
                        <div className="w-14 h-14 bg-padel-primary rounded-[1.4rem] flex items-center justify-center text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] border border-black/10">
                            <UserCircle size={28} />
                        </div>
                    </motion.div>
                </div>

                {/* Grid Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {adminCards.map((card, idx) => (
                        <motion.div
                            key={card.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Link
                                href={card.href}
                                className={`group block relative h-full bg-gradient-to-br ${card.color} to-transparent border border-white/5 rounded-[2.5rem] p-8 hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 overflow-hidden shadow-2xl backdrop-blur-sm hover:border-padel-primary/30`}
                            >
                                {/* Glow Effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-padel-primary/5 blur-[40px] rounded-full group-hover:bg-padel-primary/10 transition-colors" />

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-14 h-14 bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] group-hover:border-padel-primary/40">
                                        <card.icon className="w-7 h-7 text-gray-400 group-hover:text-padel-primary transition-colors" />
                                    </div>

                                    <div className="mt-auto">
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter mb-1 group-hover:text-white transition-colors flex items-center gap-2">
                                            {card.name}
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-snug group-hover:text-gray-400 transition-colors">
                                            {card.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Quick Stats/Status */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-16 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-40 hover:opacity-100 transition-opacity"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-padel-primary animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Core Services Online</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Play className="w-3 h-3 text-padel-primary" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Ready for action</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExternalLink className="w-3 h-3 text-padel-primary group-hover:rotate-45 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em]">Production Environment</span>
                    </div>
                </motion.div>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
