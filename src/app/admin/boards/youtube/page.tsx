'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, Monitor, ChevronLeft, ExternalLink, Play, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function YouTubeBoardsPage() {
    const searchParams = useSearchParams();
    const complexName = searchParams.get('complex') || '';
    const [copiedCourt, setCopiedCourt] = useState<number | null>(null);

    const copyToClipboard = (court: number) => {
        const url = `${window.location.origin}/display/stream/court/${court}${complexName ? `?complex=${encodeURIComponent(complexName)}` : ''}`;
        navigator.clipboard.writeText(url);
        setCopiedCourt(court);
        setTimeout(() => setCopiedCourt(null), 2000);
    };

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit p-8 md:p-12">
            <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                    <Link
                        href="/admin/boards"
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Youtube className="w-4 h-4 text-red-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Broadcast Engine</span>
                        </div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                            PIZARRAS PARA <span className="text-red-500">YOUTUBE</span>
                        </h1>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto">
                <div className="glass p-8 rounded-[3rem] border border-white/10 mb-12 bg-gradient-to-br from-red-600/5 to-transparent">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Streaming Overlays</h2>
                    </div>
                    <p className="text-gray-400 font-medium mb-8 leading-relaxed">
                        Estas pizarras están diseñadas con fondo transparente y dimensiones optimizadas para ser capturadas por software de streaming como OBS o vMix. Úsalas como un "Browser Source".
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all">
                                <div>
                                    <h3 className="text-lg font-black italic uppercase text-white">PISTA {i + 1}</h3>
                                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">Source: court-{i + 1}-stream</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => copyToClipboard(i + 1)}
                                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-500 hover:text-white"
                                        title="Copiar link para OBS"
                                    >
                                        {copiedCourt === i + 1 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                    <Link
                                        href={`/display/stream/court/${i + 1}`}
                                        target="_blank"
                                        className="p-3 bg-red-600/20 hover:bg-red-600 rounded-xl transition-all text-red-500 hover:text-white"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-gray-500 mb-4">Instrucciones OBS</h3>
                        <ul className="space-y-4 text-xs font-medium text-gray-400 italic">
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black">1</span>
                                Añade una fuente de tipo "Navegador" (Browser Source).
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black">2</span>
                                Pega la URL de la pista seleccionada.
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 text-white font-black">3</span>
                                Define el tamaño en 1920x1080.
                            </li>
                        </ul>
                    </div>

                    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center">
                        <Play className="w-12 h-12 text-red-600/20 mb-4" />
                        <h3 className="text-sm font-black uppercase tracking-widest italic text-gray-600 mb-2">Multi-Stream Coming Soon</h3>
                        <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest leading-relaxed">
                            Estamos trabajando en un panel de transmisión múltiple para directos de alta complejidad.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
            `}</style>
        </div>
    );
}
