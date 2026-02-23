'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowRight, Play, Sparkles, ExternalLink } from 'lucide-react';
import LoginButton from '@/components/LoginButton';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { dataService } from '@/lib/dataService';

export default function LandingPage() {
    const [ads, setAds] = useState<any[]>([]);
    const [currentAd, setCurrentAd] = useState<any>(null);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const allAds = await dataService.getAds();
                const activeAds = allAds.filter((ad: any) => ad.active);
                setAds(activeAds);
                if (activeAds.length > 0) {
                    // Pick a random ad
                    const randomIndex = Math.floor(Math.random() * activeAds.length);
                    setCurrentAd(activeAds[randomIndex]);
                }
            } catch (error) {
                console.error("Error fetching ads:", error);
            }
        };
        fetchAds();
    }, []);

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white relative">
            <Sidebar />

            <div className="ipad-scroll-area">
                {/* Header / Brand */}
                <div className="flex justify-between items-center mb-6 pl-32">
                    <div className="text-2xl font-black italic uppercase tracking-tighter hidden md:flex items-center">
                        <motion.div
                            animate={{
                                y: [0, -15, 0],
                                scaleY: [1, 0.8, 1],
                                scaleX: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-5 h-5 bg-padel-primary rounded-full mr-3 shadow-[0_5px_15px_rgba(204,255,0,0.4)] relative overflow-hidden flex-shrink-0"
                        >
                            <div className="absolute inset-0 border-2 border-black/10 rounded-full scale-110 -translate-x-1" />
                            <div className="absolute inset-0 border-2 border-black/10 rounded-full scale-110 translate-x-2 translate-y-2" />
                        </motion.div>
                        SMART <span className="text-padel-primary">PADEL</span>
                    </div>
                    <div className="flex-1 md:flex-none flex justify-end">
                        <LoginButton />
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    {/* Hero Section - Left Side */}
                    <div className="lg:col-span-12 xl:col-span-7 relative glass overflow-hidden flex flex-col justify-center p-8 md:p-10 min-h-[350px]">
                        {/* Background Animation / Blur */}
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-padel-primary/20 blur-[120px] rounded-full animate-pulse" />

                        <div className="relative z-10">
                            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter uppercase mb-2 drop-shadow-2xl">
                                SMART <span className="text-padel-primary">PADEL</span>
                            </h1>
                            <p className="text-base text-gray-400 max-w-xl mb-6 leading-relaxed">
                                La plataforma inteligente para gestionar torneos profesionales.
                                Generación automática de brackets y resultados en tiempo real.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/new-tournament"
                                    className="bg-padel-primary text-black px-6 py-3 rounded-xl font-black text-base flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                                >
                                    CREAR TORNEO <Trophy className="w-5 h-5" />
                                </Link>
                                <Link
                                    href="/tournaments"
                                    className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                    TORNEOS <Play className="w-5 h-5 fill-current" />
                                </Link>
                            </div>
                        </div>

                        {/* Stats Footer in Hero Card */}
                        <div className="mt-8 flex gap-8 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                            <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" /> +10k Jugadores
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy className="w-3 h-3" /> 500+ Clubes
                            </div>
                        </div>
                    </div>

                    {/* Quick Access - Right Side */}
                    <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-4">
                        <Link href="/live" className="glass p-5 group hover:border-padel-primary/50 transition-all cursor-pointer flex flex-col justify-center flex-1">
                            <h3 className="text-lg font-bold mb-1 flex items-center justify-between">
                                Brackets en Vivo <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400">Resultados instantáneos y actualización automática.</p>
                        </Link>

                        <Link href="/expenses" className="glass p-5 group hover:border-padel-primary/50 transition-all cursor-pointer flex flex-col justify-center flex-1">
                            <h3 className="text-lg font-bold mb-1 flex items-center justify-between">
                                Control de Gastos <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400">Lleva la contabilidad: inscripciones y premios.</p>
                        </Link>

                        <Link href="/agents" className="glass p-5 group hover:border-padel-primary/50 transition-all cursor-pointer flex flex-col justify-center border-padel-primary/20 flex-1">
                            <h3 className="text-lg font-padel text-padel-primary mb-1 flex items-center justify-between">
                                AGENTES AI <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                            </h3>
                            <p className="text-xs text-gray-400 italic">Consulta a nuestros expertos en ROI y Diseño.</p>
                        </Link>
                    </div>

                    {/* Publicity Banner - Dynamic */}
                    <div className="col-span-12 mt-2 h-24 md:h-32 rounded-2xl glass overflow-hidden border border-white/10 relative group">
                        {currentAd ? (
                            <a href={currentAd.targetUrl || "#"} target={currentAd.targetUrl ? "_blank" : "_self"} className="block w-full h-full">
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent z-10 flex items-center px-8">
                                    <div className="flex items-center gap-4">
                                        <div className="px-3 py-1 bg-padel-primary text-black rounded text-[8px] font-black uppercase tracking-widest">Patrocinado</div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black uppercase italic tracking-tighter text-white">{currentAd.title}</span>
                                            {currentAd.targetUrl && (
                                                <span className="text-[10px] text-padel-primary font-bold flex items-center gap-1"> Ver Más <ExternalLink className="w-2 h-2" /></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {currentAd.type === 'video' ? (
                                    <video
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    >
                                        <source src={currentAd.imageUrl} type="video/mp4" />
                                    </video>
                                ) : (
                                    <img
                                        src={currentAd.imageUrl}
                                        alt={currentAd.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                                    />
                                )}
                            </a>
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1 bg-padel-primary/20 border border-padel-primary/30 rounded text-[8px] font-black uppercase text-padel-primary tracking-widest">Ad</div>
                                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Espacio Publicitario Disponible</span>
                                    </div>
                                </div>
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover opacity-30 group-hover:opacity-60 transition-opacity"
                                >
                                    <source src="/ads-placeholder.mp4" type="video/mp4" />
                                </video>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-6 pb-24 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
                    Optimizado para iPad Landscape • SMART PADEL Pro v1.0
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
