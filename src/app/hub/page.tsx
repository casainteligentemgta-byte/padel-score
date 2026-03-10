'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    User,
    Medal,
    Users,
    Settings,
    LayoutGrid,
    Search,
    LogOut,
    Home,
    Shield,
    FileText
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import BouncingBall from '@/components/BouncingBall';
import InvitationManager from '@/components/InvitationManager';

export default function HubPage() {
    const { user, profile, logout, loading: authLoading } = useAuth();
    const router = useRouter();

    const handlePlayerClick = async () => {
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
        } catch (e) {
            console.error('HubPage: error loading player profile', e);
            router.push('/mi-cuenta');
        }
    };

    const hubItems = [
        {
            name: 'Mi Perfil',
            subtitle: 'VER MI FICHA',
            icon: User,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/10',
            onClick: handlePlayerClick
        },
        {
            name: 'Torneos',
            subtitle: 'EXPLORAR EVENTOS',
            icon: Trophy,
            color: 'text-padel-primary',
            bg: 'bg-padel-primary/10',
            border: 'border-padel-primary/10',
            href: '/tournaments'
        },
        {
            name: 'Ranking',
            subtitle: 'TABLA DE POSICIONES',
            icon: Medal,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/10',
            href: '/ranking'
        },
        {
            name: 'Comunidad',
            subtitle: 'BUSCAR JUGADORES',
            icon: Users,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/10',
            disabled: true
        }
    ];


    if (authLoading) {
        return (
            <div className="h-screen bg-[#080808] flex items-center justify-center">
                <BouncingBall size={32} bounceHeight={2} />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit relative overflow-hidden flex flex-col items-center">
            {/* Sidebar removed for minimalist view on Hub */}

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-padel-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full h-full">
                {/* Header */}
                <header className="w-full max-w-md px-6 pt-16 pb-8 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                            HOLA, <span className="text-padel-primary">{profile?.name?.split(' ')[0] || 'CRACK'}</span>
                        </h1>
                        {profile?.uniqueCode && (
                            <div className="mt-2 flex flex-col items-center">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Tu Código de Jugador</span>
                                <span className="text-lg font-black text-white tracking-[0.2em] font-mono bg-white/5 px-4 py-1 rounded-full border border-white/10 mt-1">
                                    {profile.uniqueCode}
                                </span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="w-full max-w-md px-6 flex-1">
                    <div className="w-full">
                        {/* Hub Grid */}
                        <div className="grid grid-cols-2 gap-3 pb-8">
                            {hubItems.map((item, index) => (
                                <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        if (item.disabled) return;
                                        if (item.onClick) item.onClick();
                                        else if (item.href) router.push(item.href);
                                    }}
                                    className={`relative group w-full h-32 rounded-[28px] p-4 flex flex-col items-center justify-center text-center transition-all overflow-hidden border ${item.disabled
                                        ? 'bg-zinc-900/20 border-white/5 opacity-40 cursor-not-allowed'
                                        : `bg-zinc-900/40 ${item.border} hover:bg-zinc-900/60 hover:border-white/20 hover:-translate-y-1`
                                        }`}
                                >
                                    {/* Icon Container - Even Smaller */}
                                    <div className={`p-2 rounded-xl mb-2 transition-all group-hover:scale-110 shadow-lg ${item.bg} ${item.color}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex flex-col gap-0 w-full items-center">
                                        <h3 className="text-[10px] font-black uppercase italic tracking-tighter text-white group-hover:text-padel-primary transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-[6px] font-bold text-zinc-600 uppercase tracking-widest line-clamp-1">{item.subtitle}</p>
                                    </div>

                                    {/* Status Label */}
                                    {item.disabled && (
                                        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10">
                                            <span className="text-[6px] font-black uppercase tracking-widest text-zinc-600 italic">Próximamente</span>
                                        </div>
                                    )}

                                    {/* Decorative Gradient Overlay */}
                                    {!item.disabled && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/0 to-padel-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="space-y-6 mb-8">
                            <InvitationManager />
                        </div>

                        {/* Logout Button */}
                        <div className="flex justify-center mt-4 mb-12">
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-2 text-[#FF2800] font-black uppercase italic tracking-[0.2em] text-[10px] hover:scale-105 transition-all bg-transparent border-none outline-none"
                            >
                                <LogOut className="w-3.5 h-3.5 text-[#FF2800]" />
                                FINALIZAR SESIÓN
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
