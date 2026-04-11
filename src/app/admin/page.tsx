'use client';

import { motion } from 'framer-motion';
import {
    Users,
    Trophy,
    Settings,
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

                    {/* Hero: ancho como la rejilla de abajo; texto sobre la imagen */}
                    <div className="mb-2 sm:mb-4 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative w-full min-h-[12rem] sm:min-h-[15rem] lg:min-h-[17rem] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-[#0a0a0a] group"
                        >
                            <img
                                src="/images/padel_hero.png"
                                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[2.2s] group-hover:scale-[1.03]"
                                alt="Padel court"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/25 pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none sm:from-black/40" />
                            <div className="absolute inset-0 bg-padel-primary/[0.05] pointer-events-none" />

                            <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-7 lg:p-10">
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 }}
                                    className="w-full flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-10"
                                >
                                    <div className="max-w-xl">
                                        <h2 className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-black italic uppercase tracking-tighter text-white leading-[1.05] mb-1.5 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                                            DOMINA TU <br />
                                            <span className="text-padel-primary">TORNEO</span>
                                        </h2>
                                        <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-widest text-white/90 max-w-md drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
                                            Gestión profesional de marcadores, categorías e inscripciones en tiempo real.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => router.push('/admin/master-generator')}
                                        className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-white/20 bg-padel-primary px-6 py-3.5 sm:px-8 sm:py-4 text-black font-black uppercase italic tracking-wider text-[10px] sm:text-xs shadow-[0_8px_32px_rgba(204,255,0,0.35)] hover:brightness-110 hover:shadow-[0_12px_40px_rgba(204,255,0,0.45)] active:scale-[0.98] transition-all"
                                    >
                                        Generar Torneos
                                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Navigation: una sola fila (scroll horizontal en pantallas muy estrechas) */}
                    <div className="flex flex-nowrap items-stretch gap-1.5 sm:gap-2 md:gap-3 overflow-x-auto pb-1 [scrollbar-width:thin] [-ms-overflow-style:none] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
                        {adminSections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx + 0.6 }}
                                className="min-w-[7rem] shrink-0 sm:min-w-0 sm:flex-1 sm:basis-0 sm:shrink"
                            >
                                <Link
                                    href={section.href}
                                    title={section.desc}
                                    className={`group relative flex h-full min-h-[4.75rem] w-full min-w-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-xl border bg-gradient-to-br px-1.5 py-2 text-center shadow-md transition-all duration-300 hover:scale-[1.02] sm:min-h-[5.25rem] sm:gap-2 sm:px-2 sm:py-2.5 md:min-h-[5.5rem] md:px-2.5 ${section.color} ${section.borderColor}`}
                                >
                                    <div className="pointer-events-none absolute -right-3 -bottom-3 opacity-[0.04] transition-opacity group-hover:opacity-[0.08]">
                                        <section.icon className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.25} />
                                    </div>

                                    <ChevronRight className="absolute right-1 top-1 z-20 h-3 w-3 text-white/40 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 sm:right-1.5 sm:top-1.5 sm:h-3.5 sm:w-3.5" />

                                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/5 bg-black/40 sm:h-9 sm:w-9 ${section.iconColor}`}>
                                        <section.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
                                    </div>

                                    <h3 className="relative z-10 w-full max-w-full whitespace-normal break-words text-balance px-0.5 text-[7px] font-black uppercase leading-snug tracking-tight text-white sm:text-[8px] md:text-[9px] lg:text-[10px]">
                                        {section.title}
                                    </h3>
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
