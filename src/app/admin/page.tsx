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
    Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
            title: "Gestión de Usuarios",
            desc: "Roles, permisos y control de accesos",
            icon: Users,
            href: "/admin/users",
            color: "from-padel-primary/20 to-padel-primary/5",
            borderColor: "border-padel-primary/30",
            iconColor: "text-padel-primary"
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
            title: "Configuración App",
            desc: "Nombre del club, zona horaria y logo",
            icon: Settings2,
            href: "/admin/settings",
            color: "from-orange-500/20 to-orange-500/5",
            borderColor: "border-orange-500/30",
            iconColor: "text-orange-400"
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
        }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-padel-primary selection:text-black font-outfit">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-padel-primary/10 blur-[130px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            {/* Sidebar Navigation (Hidden on mobile) */}
            <aside className="fixed left-0 top-0 bottom-0 w-24 hidden lg:flex flex-col items-center py-10 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-50">
                <div className="w-12 h-12 bg-padel-primary rounded-2xl flex items-center justify-center mb-12 shadow-[0_0_20px_rgba(204,255,0,0.3)]">
                    <ShieldCheck className="w-7 h-7 text-black" />
                </div>

                <nav className="flex-1 flex flex-col gap-8">
                    <button className="p-4 rounded-2xl bg-padel-primary/10 text-padel-primary border border-padel-primary/20"><Layout className="w-6 h-6" /></button>
                    <button onClick={() => router.push('/admin/users')} className="p-4 rounded-2xl text-gray-600 hover:text-white transition-colors"><Users className="w-6 h-6" /></button>
                    <button onClick={() => router.push('/admin/tournaments')} className="p-4 rounded-2xl text-gray-600 hover:text-white transition-colors"><Trophy className="w-6 h-6" /></button>
                    <button onClick={() => router.push('/admin/settings')} className="p-4 rounded-2xl text-gray-600 hover:text-white transition-colors"><Settings className="w-6 h-6" /></button>
                </nav>

                <button onClick={logout} className="p-4 rounded-2xl text-gray-700 hover:text-red-500 transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* Main Content Area */}
            <main className="lg:pl-24 relative z-10">
                {/* Global Top Bar */}
                <header className="px-8 py-6 flex flex-col sm:flex-row justify-between items-center bg-black/20 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="lg:hidden w-10 h-10 bg-padel-primary rounded-xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-black" />
                        </div>
                        <div>
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-padel-primary italic">Control Tower Pro</h4>
                            <h2 className="text-xl font-black uppercase italic tracking-tighter">Panel de <span className="text-padel-primary">Administración</span></h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 group focus-within:border-padel-primary/30 transition-all">
                            <Search className="w-4 h-4 text-gray-500 group-focus-within:text-padel-primary" />
                            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-wider text-white placeholder:text-gray-700 w-32" />
                        </div>

                        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase italic tracking-tighter text-white">{profile?.name || 'Administrador'}</p>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-padel-primary/60">Super Admin</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-padel-primary/20 to-black border border-padel-primary/30 flex items-center justify-center font-black text-padel-primary">
                                {profile?.name?.[0] || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <div className="px-8 py-10 max-w-7xl mx-auto">

                    {/* Welcome Card & Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-2 relative h-64 rounded-[3rem] overflow-hidden group shadow-2xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/30 via-padel-primary/5 to-transparent z-10" />
                            <img
                                src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-110 transition-transform duration-[2s]"
                                alt="Padel court"
                            />
                            <div className="absolute inset-0 bg-black/40 z-0" />
                            <div className="relative z-20 p-10 h-full flex flex-col justify-end">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none mb-2">
                                        DOMINA TU <br /><span className="text-padel-primary">TORNEO</span>
                                    </h2>
                                    <p className="text-xs font-bold uppercase tracking-widest text-padel-primary/80 mb-6 max-w-md">
                                        Gestión profesional de marcadores, categorías e inscripciones en tiempo real.
                                    </p>
                                    <button onClick={() => router.push('/admin/tournaments')} className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl hover:bg-padel-primary transition-colors">
                                        Gestionar Torneos <Activity className="w-4 h-4 animate-pulse" />
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>

                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between hover:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Estado General</h4>
                                    <p className="text-2xl font-black uppercase italic leading-none">Sistema <span className="text-emerald-400">Activo</span></p>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 flex flex-col justify-between hover:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Alertas Pendientes</h4>
                                    <p className="text-2xl font-black uppercase italic leading-none">0 <span className="text-blue-400 text-sm">Novedades</span></p>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Navigation Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {adminSections.map((section, idx) => (
                            <motion.div
                                key={section.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * idx + 0.6 }}
                            >
                                <Link
                                    href={section.href}
                                    className={`block group relative h-full bg-gradient-to-br ${section.color} border ${section.borderColor} rounded-[2.5rem] p-8 hover:scale-[1.02] transition-all duration-500 shadow-xl overflow-hidden`}
                                >
                                    {/* Decorator */}
                                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <section.icon size={120} />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/40 border border-white/5 ${section.iconColor}`}>
                                            <section.icon className="w-7 h-7" />
                                        </div>

                                        <h3 className="text-base font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                            {section.title}
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </h3>

                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors italic">
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
                        className="mt-16 flex flex-wrap justify-center items-center gap-10 opacity-30 hover:opacity-100 transition-opacity"
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
