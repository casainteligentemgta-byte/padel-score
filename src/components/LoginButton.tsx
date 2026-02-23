'use client';

import { useAuth } from '@/lib/AuthContext';
import { LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginButton() {
    const { user, logout, enableDevMode } = useAuth();

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-white font-bold text-sm leading-none">{user.displayName}</span>
                    <button
                        onClick={logout}
                        className="text-[10px] text-gray-500 hover:text-red-400 font-black uppercase tracking-widest mt-1 transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-padel-primary/30"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-padel-primary flex items-center justify-center text-black font-black">
                        {user.displayName?.charAt(0) || 'U'}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-end gap-2 text-right">
            <Link
                href="/login"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-2.5 rounded-xl transition-all group shadow-xl"
            >
                <LogIn className="w-4 h-4 text-padel-primary group-hover:translate-x-1 transition-transform" />
                <span className="text-xs font-black uppercase tracking-widest">Acceder a Mi Cuenta</span>
            </Link>
            <button
                onClick={() => enableDevMode()}
                className="text-[9px] text-gray-800 hover:text-padel-primary font-bold uppercase tracking-wider transition-colors"
            >
                Entrada Rápida (Simulación)
            </button>
        </div>
    );
}
