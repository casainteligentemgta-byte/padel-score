'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Menu,
    X,
    Trophy,
    Users,
    Settings,
    LogOut,
    Sparkles,
    Home,
    Megaphone,
    Brain,
    DollarSign,
    Crosshair,
    Medal,
    Radio,
    User,
    Wallet,
    ShieldCheck,
    FileText,
    Receipt,
    LayoutGrid,
    ChevronRight,
    Bell
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { useRouter } from 'next/navigation';
import { getCanchaLabel } from '@/lib/markerCanchas';
import { dataService } from '@/lib/dataService';
import BouncingBall from '@/components/BouncingBall';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const { logout, isAdmin, markerCanchas, user } = useAuth();
    const { appTitle, clubName } = useAppSettings();
    const router = useRouter();

    const handleMisDatosClick = async () => {
        setIsOpen(false);
        if (!user?.uid) {
            router.push('/login');
            return;
        }
        try {
            const mine = await dataService.getMyParticipants(user.uid);
            const player = mine?.[0];
            if (player?.id) {
                // Si ya tiene ficha, vamos al formulario de edición (rellenado)
                router.push(`/players/register?edit=${player.id}`);
            } else {
                // Si no tiene ficha, vamos al registro inicial
                router.push('/players/register?mis-datos=1');
            }
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error('Sidebar: error cargando ficha de jugador', msg || e);
            router.push('/mi-cuenta');
        }
    };

    const hubItems = [
        { name: 'Perfil', onClick: handleMisDatosClick, icon: User, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { name: 'Torneos', href: '/tournaments', icon: Trophy, color: 'text-padel-primary', bg: 'bg-padel-primary/10' },
        { name: 'Ranking', href: '/ranking', icon: Medal, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { name: 'Wallet', onClick: () => { }, icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-400/10', disabled: true },
    ];

    const adminItems = [
        { name: 'Generador Maestro', href: '/admin/master-generator', icon: Sparkles },
        { name: 'Control de Gastos', href: '/expenses', icon: DollarSign },
        { name: 'Validación de pagos', href: '/admin/validacion-pagos', icon: Receipt },
        { name: 'Agentes AI', href: '/agents', icon: Brain },
        { name: 'Jugadores', href: '/players', icon: Users },
        { name: 'Publicidad', href: '/admin/publicidad', icon: Megaphone },
    ];

    const otherItems = [
        { name: 'Inicio', href: '/', icon: Home },
        ...(isAdmin ? [{ name: 'Live', href: '/live', icon: Radio }] : []),
        ...(markerCanchas?.length > 0 ? markerCanchas.map((c) => ({ name: `Marcador ${getCanchaLabel(c)}`, href: `/marker/${c}`, icon: Crosshair })) : []),
        { name: 'Privacidad', href: '/politica-privacidad', icon: ShieldCheck },
        { name: 'Términos', href: '/terminos-inscripcion', icon: FileText },
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-6 left-6 z-[100] w-12 h-12 bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-all text-white shadow-2xl"
            >
                <Menu className="w-5 h-5 text-padel-primary" />
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
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110]"
                        />

                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed top-0 left-0 bottom-0 w-full sm:w-[350px] bg-[#080808] border-r border-white/5 z-[120] flex flex-col overflow-hidden"
                        >
                            {/* Decorative Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-padel-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                            <div className="p-8 pb-4 flex justify-between items-start relative z-10">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <BouncingBall size={24} bounceHeight={1.5} />
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                            SMART <span className="text-padel-primary">PADEL</span>
                                        </h2>
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-9">
                                        {clubName || 'Smart Padel Experience'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>


                            {/* Main Hub Grid */}
                            <div className="px-8 mb-8 relative z-10">
                                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.3em] mb-4 flex items-center gap-2">
                                    <LayoutGrid className="w-3 h-3 text-padel-primary" /> Mi Panel
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {hubItems.map((item) => (
                                        <button
                                            key={item.name}
                                            disabled={item.disabled}
                                            onClick={() => {
                                                if (item.onClick) item.onClick();
                                                else if (item.href) {
                                                    setIsOpen(false);
                                                    router.push(item.href);
                                                }
                                            }}
                                            className={`relative group h-28 p-4 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all border ${item.disabled
                                                ? 'bg-zinc-900/40 border-white/5 opacity-40 grayscale cursor-not-allowed'
                                                : 'bg-zinc-900/60 border-white/5 hover:border-padel-primary/30 hover:bg-zinc-800'
                                                }`}
                                        >
                                            <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${item.bg} ${item.color}`}>
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors italic">
                                                {item.name}
                                            </span>
                                            {item.disabled && (
                                                <span className="absolute top-2 right-2 text-[8px] font-black uppercase text-zinc-600">Soon</span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Navigation Lists */}
                            <div className="px-8 flex-1 overflow-y-auto no-scrollbar space-y-8 pb-8 relative z-10">
                                {/* Other Nav */}
                                <div className="space-y-1">
                                    {otherItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 py-3 px-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/[0.03] transition-all group"
                                        >
                                            <item.icon className="w-4 h-4 text-zinc-600 group-hover:text-padel-primary transition-colors" />
                                            <span className="text-xs font-black uppercase italic tracking-tight">{item.name}</span>
                                            <ChevronRight className="ml-auto w-4 h-4 text-zinc-800 group-hover:text-padel-primary/40 group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    ))}
                                </div>

                                {/* Admin Section */}
                                {isAdmin && (
                                    <div className="pt-4">
                                        <p className="text-[10px] font-black uppercase text-padel-primary tracking-[0.3em] mb-4 ml-4">Consola Admin</p>
                                        <div className="space-y-1">
                                            {adminItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 py-3 px-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-padel-primary/5 transition-all group"
                                                >
                                                    <item.icon className="w-4 h-4 text-zinc-600 group-hover:text-padel-primary transition-colors" />
                                                    <span className="text-xs font-black uppercase italic tracking-tight">{item.name}</span>
                                                    <ChevronRight className="ml-auto w-4 h-4 text-zinc-800 group-hover:text-padel-primary/40 group-hover:translate-x-1 transition-all" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Section */}
                            <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-3xl space-y-4 relative z-10">
                                {isAdmin && (
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setIsOpen(false)}
                                        className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase italic tracking-tight">Ajustes del Sistema</span>
                                    </Link>
                                )}
                                <button
                                    onClick={async () => {
                                        await logout();
                                        setIsOpen(false);
                                        router.replace('/login');
                                    }}
                                    className="w-full flex items-center gap-3 py-3 px-4 rounded-2xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all group border border-red-500/10"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase italic tracking-tight">Finalizar Sesión</span>
                                </button>

                                <div className="pt-2 text-center">
                                    <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em] italic">Smart Padel v3.0 Pro</p>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
