'use client';

import { motion } from 'framer-motion';
import {
    Users,
    Trophy,
    Settings,
    Layout,
    MessageSquare,
    ShieldCheck,
    BarChart3,
    ChevronRight,
    Search,
    Bell,
    Settings2,
    LogOut,
    ExternalLink,
    PieChart,
    Activity,
    Smartphone,
    Brain,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import BouncingBall from '@/components/BouncingBall';

export default function AdminHubPage() {
    const { isAdmin, loading, profile, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.replace('/');
        }
    }, [isAdmin, loading, router]);

    if (loading) return (
        <div className="h-screen bg-[#050505] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
        </div>
    );

    if (!isAdmin) return null;

    const adminSections = [
        {
            title: "Gestión de Jugadores",
            desc: "Administración de usuarios y niveles",
            icon: Users,
            href: "/admin/users",
            color: "from-padel-primary/20 to-padel-primary/5",
            borderColor: "border-padel-primary/30",
            iconColor: "text-padel-primary"
        },
        {
            title: "Ajustes del Club",
            desc: "Configuración general y parámetros",
            icon: Settings2,
            href: "/admin/settings",
            color: "from-orange-500/20 to-orange-500/5",
            borderColor: "border-orange-500/30",
            iconColor: "text-orange-400"
        },
        {
            title: "Torneos y Eventos",
            desc: "Generador de fixtures y categorías",
            icon: Trophy,
            href: "/admin/tournaments",
            color: "from-blue-500/20 to-blue-500/5",
            borderColor: "border-blue-500/30",
            iconColor: "text-blue-400"
        },
        {
            title: "Publicidad y Ads",
            desc: "Banners y patrocinadores activos",
            icon: Smartphone,
            href: "/admin/publicidad",
            color: "from-purple-500/20 to-purple-500/5",
            borderColor: "border-purple-500/30",
            iconColor: "text-purple-400"
        },
        {
            title: "Validación de Pagos",
            desc: "Control de ingresos e inscripciones",
            icon: BarChart3,
            href: "/admin/validacion-pagos",
            color: "from-emerald-500/20 to-emerald-500/5",
            borderColor: "border-emerald-500/30",
            iconColor: "text-emerald-400"
        },
        {
            title: "Boards & Marcadores",
            desc: "Visualización en pantallas del club",
            icon: Layout,
            href: "/admin/boards",
            color: "from-rose-500/20 to-rose-500/5",
            borderColor: "border-rose-500/30",
            iconColor: "text-rose-400"
        },
        {
            title: "Agentes AI Pro",
            desc: "Inteligencia artificial para tu club",
            icon: Brain,
            href: "/admin/agents",
            color: "from-pink-500/20 to-pink-500/5",
            borderColor: "border-pink-500/30",
            iconColor: "text-pink-400"
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-padel-primary selection:text-black font-outfit">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-padel-primary/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>


            {/* Main Content Area */}
            <main className="relative z-10 w-full">
                {/* Global Top Bar */}
                <header className="px-4 sm:px-8 py-2 sm:py-3 flex flex-col sm:flex-row justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                        <BouncingBall size={20} bounceHeight={1.4} />
                        <div>
                            <h4 className="text-[7px] font-black uppercase tracking-[0.4em] text-padel-primary italic">Control Tower Pro</h4>
                            <h2 className="text-sm sm:text-base lg:text-xl font-black uppercase italic tracking-tighter">
                                SMART <span className="text-padel-primary">PADEL</span> ADMIN
                            </h2>
                        </div>
                    </div>


                    <div className="flex items-center gap-3 sm:gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 group focus-within:border-padel-primary/30 transition-all">
                            <Search className="w-3 h-3 text-gray-500 group-focus-within:text-padel-primary" />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-wider text-white placeholder:text-gray-700 w-24 sm:w-32" />
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 border-l border-white/10 pl-4 sm:pl-6">
                            <div className="text-right">
                                <p className="text-[8px] sm:text-[10px] font-black uppercase italic tracking-tighter text-white">{profile?.name || 'Administrador'}</p>
                                <p className="text-[7px] sm:text-[8px] font-bold uppercase tracking-widest text-padel-primary/60">Super Admin</p>
                            </div>
                            <div className="relative group">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-padel-primary/20 to-black border border-padel-primary/30 flex items-center justify-center text-[10px] sm:text-xs font-black text-padel-primary">
                                    {profile?.name?.[0] || 'A'}
                                </div>
                                <button
                                    onClick={async () => {
                                        await logout();
                                        router.replace('/login');
                                    }}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-md flex items-center justify-center border-2 border-[#050505] hover:scale-110 active:scale-95 transition-all text-white shadow-xl"
                                    title="Cerrar sesión"
                                >
                                    <LogOut className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="px-4 sm:px-6 py-2 sm:py-4 max-w-7xl mx-auto">

                    {/* Welcome Card & Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 sm:gap-3 mb-2 sm:mb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="md:col-span-2 relative h-24 sm:h-32 lg:h-40 rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/30 via-padel-primary/5 to-transparent z-10" />
                            <img
                                src="/images/padel_hero.png"
                                className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s]"
                                alt="Padel court"
                            />
                            <div className="absolute inset-0 bg-black/40 z-0" />
                            <div className="relative z-20 p-4 sm:p-8 h-full flex flex-col justify-end">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-sm sm:text-lg lg:text-3xl font-black italic uppercase tracking-tighter text-white leading-tight mb-0.5">
                                        DOMINA TU <br /><span className="text-padel-primary">TORNEO</span>
                                    </h2>
                                    <p className="text-[8px] sm:text-[9px] lg:text-xs font-bold uppercase tracking-widest text-padel-primary/80 mb-2 sm:mb-4 max-w-md">
                                        Gestión profesional de marcadores, categorías e inscripciones en tiempo real.
                                    </p>
                                    <button onClick={() => router.push('/admin/tournaments')} className="inline-flex items-center gap-2 bg-white text-black px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-black uppercase italic text-[7px] sm:text-[9px] shadow-xl hover:bg-padel-primary transition-colors">
                                        Gestionar Torneos <Activity className="w-2 h-2 sm:w-3 h-3 animate-pulse" />
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>

                        <div className="md:col-span-2 grid grid-cols-2 gap-2 sm:gap-3">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[1rem] sm:rounded-[1.5rem] p-2 sm:p-3 flex flex-col justify-between hover:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-[7px] font-black uppercase tracking-widest text-gray-500">Estado General</h4>
                                    <p className="text-sm sm:text-lg font-black uppercase italic leading-none">Sistema <span className="text-emerald-400">Activo</span></p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[1rem] sm:rounded-[1.5rem] p-2 sm:p-3 flex flex-col justify-between hover:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex justify-between items-start mb-1 sm:mb-4">
                                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Activity className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                                    </div>
                                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-[7px] font-black uppercase tracking-widest text-gray-500">Alertas</h4>
                                    <p className="text-sm sm:text-lg font-black uppercase italic leading-none">0 <span className="text-blue-400 text-[8px]">Novedades</span></p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        {adminSections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx + 0.6 }}
                            >
                                <Link
                                    href={section.href}
                                    className={`block group relative h-24 sm:h-28 lg:h-32 bg-gradient-to-br ${section.color} border ${section.borderColor} rounded-[1rem] sm:rounded-[1.2rem] p-2 sm:p-3 lg:p-4 hover:scale-[1.02] transition-all duration-500 shadow-xl overflow-hidden`}
                                >
                                    {/* Decorator */}
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-15 transition-opacity">
                                        <section.icon size={80} className="sm:size-100 lg:size-120" />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 bg-black/40 border border-white/5 ${section.iconColor}`}>
                                            <section.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </div>

                                        <h3 className="text-[10px] sm:text-[12px] lg:text-base font-black uppercase tracking-widest mb-0.5 sm:mb-1 flex items-center gap-2">
                                            {section.title}
                                            <ChevronRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </h3>

                                        <p className="text-[7px] sm:text-[9px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors italic leading-tight line-clamp-1">
                                            {section.desc}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Access Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="mt-8 lg:mt-16 hidden lg:flex flex-wrap justify-center items-center gap-10 opacity-30 hover:opacity-100 transition-opacity"
                    >
                        <div className="flex items-center gap-3 text-gray-500">
                            <Smartphone className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mobile View Optimized</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <Activity className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">RTDB Live Sync</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Supabase Identity Core</span>
                        </div>
                    </motion.div>

                    {/* Secondary Logout Button */}
                    <div className="mt-12 mb-8 flex justify-center">
                        <button
                            onClick={async () => {
                                await logout();
                                router.replace('/login');
                            }}
                            className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 rounded-2xl transition-all group"
                        >
                            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-white transition-colors">
                                Finalizar Sesión Administrativa
                            </span>
                        </button>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
