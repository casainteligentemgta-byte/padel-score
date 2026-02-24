'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    UserPlus,
    Trophy,
    Users,
    Settings,
    LogOut,
    Sparkles,
    Home,
    Shield,
    Monitor,
    LayoutDashboard,
    Megaphone,
    Brain
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAdmin, isMarker } = useAuth();
    const router = useRouter();

    const menuItems = [
        { name: 'Inicio', href: '/', icon: Home },
        { name: 'Torneos', href: '/tournaments', icon: Trophy },
    ];

    const adminItems = [
        { name: 'Generador Maestro', href: '/admin/master-generator', icon: Sparkles },
        { name: 'Módulo Pizarras', href: '/admin/boards', icon: LayoutDashboard },
        { name: 'Agentes AI', href: '/agents', icon: Sparkles },
        { name: 'Base Conocimiento IA', href: '/admin/knowledge', icon: Brain },
        { name: 'Agregar Jugador', href: '/players/register', icon: UserPlus },
        { name: 'Jugadores', href: '/players', icon: Users },
        { name: 'Publicidad', href: '/admin/ads', icon: Megaphone },
        { name: 'Monitor Canchas', href: '/admin/monitor', icon: Monitor },
        { name: 'Gestión Usuarios', href: '/admin/users', icon: Settings },
        { name: 'Vigilancia (Logs)', href: '/admin/logs', icon: Shield },
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-[100] w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all text-white"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[280px] bg-black/40 backdrop-blur-2xl border-r border-white/10 z-[120] p-6 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
                        >
                            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                                <div className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center">
                                    <motion.div
                                        animate={{
                                            y: [0, -10, 0],
                                            scaleY: [1, 0.8, 1],
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="w-4 h-4 bg-padel-primary rounded-full mr-2 shadow-[0_4px_10px_rgba(204,255,0,0.3)]"
                                    />
                                    SMART <span className="text-padel-primary">PADEL</span>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-4 overflow-y-auto no-scrollbar pr-2 min-h-0">
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-600 tracking-[0.2em] mb-2 ml-4">App</p>
                                    <div className="space-y-1">
                                        {menuItems.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <motion.div
                                                    whileHover={{ x: 5, backgroundColor: 'rgba(204,255,0,0.1)' }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-gray-400 hover:text-padel-primary transition-all group"
                                                >
                                                    <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                    <span className="font-bold text-[12px] tracking-tight uppercase italic">{item.name}</span>
                                                </motion.div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                {isAdmin && (
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-padel-primary tracking-[0.2em] mb-2 ml-4">Admin</p>
                                        <div className="space-y-1">
                                            {adminItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-gray-400 hover:bg-padel-primary/10 hover:text-padel-primary transition-all group"
                                                >
                                                    <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                    <span className="font-bold text-[12px] tracking-tight uppercase italic">{item.name}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </nav>

                            <div className="pt-4 mt-auto border-t border-white/5 space-y-1">
                                <button
                                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-gray-500 hover:bg-white/5 hover:text-white transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span className="font-bold text-xs uppercase italic">Ajustes</span>
                                </button>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                        router.push('/');
                                    }}
                                    className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-500/50 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="font-bold text-xs uppercase italic">Cerrar Sesión</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
