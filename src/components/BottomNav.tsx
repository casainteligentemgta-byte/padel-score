'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Trophy,
    Users,
    User,
    PlusCircle
} from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const tabs = [
        { name: 'Inicio', href: '/tournaments', icon: Home, match: '/tournaments' },
        { name: 'Partidos', href: '#', icon: Trophy, match: '/matches' },
        { name: 'Jugadores', href: '/players', icon: Users, match: '/players' },
        { name: 'Perfil', href: '/players/register', icon: User, match: '/players/register' },
    ];

    return (
        <footer className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 px-6 pb-8 pt-4 z-[100]">
            <div className="max-w-md mx-auto flex justify-between items-center">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href || (tab.href !== '#' && pathname.startsWith(tab.match));
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-padel-primary scale-110' : 'text-gray-600 hover:text-gray-400'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-padel-primary/20' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </footer>
    );
}
