'use client';

import Link from 'next/link';
import { Home, Trophy } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-padel-primary/10 blur-[120px] rounded-full" />
            </div>
            <div className="relative z-10 text-center max-w-md">
                <p className="text-padel-primary font-black text-[10px] uppercase tracking-[0.3em] mb-2">Error 404</p>
                <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter mb-3">
                    Página no encontrada
                </h1>
                <p className="text-gray-500 text-sm mb-8">
                    El enlace puede estar roto o la página ya no existe.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-padel-primary text-black rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                    >
                        <Home className="w-4 h-4" /> Inicio
                    </Link>
                    <Link
                        href="/tournaments"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/10"
                    >
                        <Trophy className="w-4 h-4" /> Torneos
                    </Link>
                </div>
            </div>
        </div>
    );
}
