'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    Monitor,
    Tv,
    Youtube,
    Settings,
    ChevronRight,
    ChevronLeft,
    Maximize2,
    ExternalLink,
    Play,
    Radio,
    MapPin,
    Trophy,
    Search
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const COMPLEXES = [
    { name: 'Margarita Padel', courts: 6 },
    { name: 'Tibisay', courts: 3 },
    { name: 'Sun Sol Costa Azul', courts: 4 },
    { name: 'Food Kart', courts: 3 },
    { name: 'Bodeguero', courts: 3 },
    { name: 'Elite', courts: 4 },
    { name: 'PADEL EXPERIENCE', courts: 3 },
    { name: 'Sun Sol Pedro Gonzalez', courts: 2 },
    { name: 'Playa el Agua', courts: 3 },
];

export default function BoardsModulePage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    const [selectedComplex, setSelectedComplex] = useState(COMPLEXES[0]);
    const [searchQuery, setSearchQuery] = useState('');

    if (authLoading || !isAdmin) {
        return (
            <div className="min-h-screen bg-[#080808] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-padel-primary animate-spin" />
            </div>
        );
    }

    const filteredComplexes = COMPLEXES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit relative">
            <Sidebar />

            <div className="ipad-scroll-area p-8 md:p-12 pl-24 md:pl-32">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Atrás
                </Link>
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-padel-primary/20 rounded-2xl border border-padel-primary/30">
                            <Layout className="w-6 h-6 text-padel-primary" />
                        </div>
                        <h4 className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic decoration-2">Centro de Control</h4>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                                MÓDULO <span className="text-padel-primary">DE PIZARRAS</span>
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">Gestión de pantallas, marcadores y transmisiones en vivo.</p>
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/tv"
                                target="_blank"
                                className="px-6 py-4 bg-white/5 hover:bg-padel-primary hover:text-black rounded-2xl border border-white/10 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3 group"
                            >
                                <Tv className="w-4 h-4" />
                                Monitor Principal TV
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    {/* Sidebar de Complejos */}
                    <div className="xl:col-span-4 space-y-6">
                        <div className="glass p-6 rounded-[2.5rem] border border-white/5">
                            <div className="flex items-center gap-3 mb-6 px-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest italic text-gray-400">Seleccionar Complejo</h3>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    type="text"
                                    placeholder="BUSCAR CLUB..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white uppercase tracking-widest outline-none focus:border-padel-primary/50 transition-all placeholder:text-gray-800"
                                />
                            </div>

                            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                                {filteredComplexes.map((c) => (
                                    <button
                                        key={c.name}
                                        onClick={() => setSelectedComplex(c)}
                                        className={`w-full p-4 rounded-xl text-left transition-all border flex items-center justify-between group ${selectedComplex.name === c.name
                                            ? 'bg-padel-primary/10 border-padel-primary text-padel-primary'
                                            : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black uppercase italic tracking-tight">{c.name}</span>
                                            <span className="text-[9px] font-bold opacity-60 uppercase">{c.courts} CANCHAS</span>
                                        </div>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedComplex.name === c.name ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pizarra YouTube */}
                        <div className="glass p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
                            <div className="flex items-center gap-3 mb-6 px-2">
                                <Youtube className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm font-black uppercase tracking-widest italic text-white/80">YouTube Broadcast</h3>
                            </div>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 px-2 leading-relaxed">
                                Genera una pizarra optimizada para transmisiones en vivo con overlay transparente.
                            </p>
                            <Link
                                href={`/admin/boards/youtube?complex=${encodeURIComponent(selectedComplex.name)}`}
                                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:scale-95"
                            >
                                <Play className="w-4 h-4 fill-current" />
                                Abrir Pizarra YouTube
                            </Link>
                        </div>
                    </div>

                    {/* Grid de Pizarras por Cancha */}
                    <div className="xl:col-span-8">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <div>
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                    {selectedComplex.name} <span className="text-padel-primary">DIRECTO</span>
                                </h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Sincronización en tiempo real • 4K Display Ready</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-padel-primary animate-pulse" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-padel-primary/60 italic">Signal Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: selectedComplex.courts }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="glass rounded-[2rem] border border-white/5 hover:border-padel-primary/30 transition-all group overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 italic">Pantalla Individual</span>
                                                <h4 className="text-xl font-black italic uppercase text-white group-hover:text-padel-primary transition-colors">CANCHA {i + 1}</h4>
                                            </div>
                                            <div className="p-2 bg-white/5 rounded-xl text-gray-600">
                                                <Monitor className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="aspect-video bg-black/40 rounded-2xl mb-6 flex items-center justify-center border border-white/5 relative group-hover:bg-black/60 transition-colors">
                                            <Radio className="w-8 h-8 text-white/5 group-hover:text-padel-primary/20 transition-all group-hover:scale-110" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/display/court/${i + 1}?complex=${encodeURIComponent(selectedComplex.name)}`}
                                                    target="_blank"
                                                    className="p-4 bg-padel-primary rounded-full text-black shadow-2xl hover:scale-110 transition-transform"
                                                >
                                                    <Maximize2 className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href={`/display/court/${i + 1}?complex=${encodeURIComponent(selectedComplex.name)}`}
                                                target="_blank"
                                                className="py-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                <Monitor className="w-3 h-3 text-gray-500" />
                                                Tablet
                                            </Link>
                                            <Link
                                                href={`/display/tv/${i + 1}?complex=${encodeURIComponent(selectedComplex.name)}`}
                                                target="_blank"
                                                className="py-4 bg-padel-primary/10 hover:bg-padel-primary/20 rounded-xl border border-padel-primary/30 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-padel-primary transition-all shadow-[0_0_20px_rgba(204,255,0,0.05)]"
                                            >
                                                <Tv className="w-3 h-3" />
                                                Modo TV
                                            </Link>
                                        </div>

                                        <button
                                            onClick={() => {
                                                const url = `${window.location.origin}/display/tv/${i + 1}?complex=${encodeURIComponent(selectedComplex.name)}`;
                                                navigator.clipboard.writeText(url);
                                                alert('Enlace TV copiado al portapapeles');
                                            }}
                                            className="w-full mt-3 py-2 text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-padel-primary transition-colors italic border-t border-white/5 pt-3"
                                        >
                                            Copiar Enlace TV Fijo
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Marcadores en Vivo Global */}
                <div className="mt-20 pt-12 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Radio className="w-5 h-5 text-padel-primary animate-pulse" />
                                <h4 className="text-padel-primary font-black uppercase tracking-[0.3em] text-[9px] italic">Global Live Scoreboard</h4>
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">PANTALLA DE <span className="text-padel-primary">MARCADORES EN VIVO</span></h2>
                        </div>
                        <Link
                            href="/live"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-xs font-black uppercase tracking-widest flex items-center gap-3"
                        >
                            <Trophy className="w-4 h-4 text-padel-primary" />
                            Ver Tablero General
                        </Link>
                    </div>

                    <div className="glass h-64 rounded-[3rem] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center group cursor-pointer" onClick={() => window.open('/live', '_blank')}>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-padel-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Layout className="w-16 h-16 text-white/5 group-hover:text-padel-primary/20 transition-all mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-sm group-hover:text-padel-primary transition-colors">Click para proyectar dashboard de todos los partidos</p>
                    </div>
                </div>

                <footer className="mt-20 pb-20 text-center">
                    <p className="text-[10px] font-black tracking-[0.4em] uppercase text-gray-600 italic">Smart Padel Pro • Board Management System v2.0</p>
                </footer>
            </div>

            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
