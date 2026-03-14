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
            title: "Jugadores",
            desc: "Administración de usuarios y niveles",
            icon: Users,
            href: "/admin/users",
            color: "from-padel-primary/20 to-padel-primary/5",
            borderColor: "border-padel-primary/30",
            iconColor: "text-padel-primary"
        },
        {
            title: "Torneos",
            desc: "Generador de fixtures y categorías",
            icon: Trophy,
            href: "/tournaments",
            color: "from-blue-500/20 to-blue-500/5",
            borderColor: "border-blue-500/30",
            iconColor: "text-blue-400"
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
            title: "Publicidad y ADS",
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
            title: "Agentes AI Pro",
            desc: "Inteligencia artificial para tu club",
            icon: Brain,
            href: "/agents",
            color: "from-pink-500/20 to-pink-500/5",
            borderColor: "border-pink-500/30",
            iconColor: "text-pink-400"
        },
        {
            title: "Ajustes del Club",
            desc: "Configuración general y parámetros",
            icon: Settings2,
            href: "/admin/settings",
            color: "from-orange-500/20 to-orange-500/5",
            borderColor: "border-orange-500/30",
            iconColor: "text-orange-400"
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
                        {/* Buscador removido a petición del usuario */}

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
                    <div className="mb-2 sm:mb-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative h-28 sm:h-36 lg:h-44 rounded-2xl sm:rounded-3xl overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/30 via-padel-primary/5 to-transparent z-10" />
                            <img
                                src="/images/padel_hero.png"
                                className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s]"
                                alt="Padel court"
                            />
                            <div className="absolute inset-0 bg-black/40 z-0" />
                            <div className="relative z-20 p-6 sm:p-10 h-full flex flex-col justify-end">
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
                                    <button onClick={() => router.push('/admin/master-generator')} className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-black uppercase italic text-[8px] sm:text-[10px] shadow-xl hover:bg-padel-primary transition-colors">
                                        Generar Torneos <Activity className="w-3 h-3 animate-pulse" />
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                        {adminSections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx + 0.6 }}
                            >
                                <Link
                                    href={section.href}
                                    className={`block group relative h-16 sm:h-20 lg:h-22 bg-gradient-to-br ${section.color} border ${section.borderColor} rounded-xl p-2 sm:p-3 hover:scale-[1.02] transition-all duration-500 shadow-md overflow-hidden flex flex-col justify-between`}
                                >
                                    {/* Decorator - Minimalist opacity */}
                                    <div className="absolute -right-2 -bottom-2 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                        <section.icon size={60} className="sm:size-70 lg:size-80" />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full justify-between">
                                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center bg-black/40 border border-white/5 ${section.iconColor}`}>
                                            <section.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </div>

                                        <div className="mt-auto">
                                            <h3 className="text-[10px] sm:text-[11px] lg:text-[13px] font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                                                {section.title}
                                                <ChevronRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </h3>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Logout Button - Moved up and styled in Ferrari Red */}
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={async () => {
                                await logout();
                                router.replace('/login');
                            }}
                            className="flex items-center gap-2 group transition-all hover:scale-105 active:scale-95 bg-transparent border-none outline-none cursor-pointer"
                        >
                            <LogOut className="w-4 h-4 text-[#FF2800]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF2800] italic drop-shadow-[0_0_8px_rgba(255,40,0,0.3)]">
                                Finalizar Sesión Administrativa
                            </span>
                        </button>
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
                </div>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
