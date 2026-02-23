'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowRight, Play } from 'lucide-react';
import LoginButton from '@/components/LoginButton';

import Sidebar from '@/components/Sidebar';

export default function LandingPage() {
    return (
        <div className="h-screen bg-[#0a0a0a] text-white overflow-hidden flex flex-col p-6 relative">
            <Sidebar />

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
                <div className="lg:col-span-12 xl:col-span-7 relative glass overflow-hidden flex flex-col justify-center p-8 md:p-12">
                    {/* Background Animation / Blur */}
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-padel-primary/20 blur-[120px] rounded-full animate-pulse" />

                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-4 drop-shadow-2xl">
                            SMART <span className="text-padel-primary">PADEL</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-8 leading-relaxed">
                            La plataforma inteligente para gestionar torneos profesionales.
                            Generación automática de brackets y resultados en tiempo real.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href="/new-tournament"
                                className="bg-padel-primary text-black px-8 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform"
                            >
                                CREAR TORNEO <Trophy className="w-6 h-6" />
                            </Link>
                            <Link
                                href="/tournaments"
                                className="bg-white/5 border border-white/10 px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                MIS TORNEOS <Play className="w-5 h-5 fill-current" />
                            </Link>
                        </div>
                    </div>

                    {/* Stats Footer in Hero Card */}
                    <div className="mt-12 flex gap-8 text-gray-500 font-bold uppercase tracking-widest text-xs">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> +10k Jugadores
                        </div>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4" /> 500+ Clubes
                        </div>
                    </div>
                </div>

                {/* Quick Access - Right Side */}
                <div className="lg:col-span-12 xl:col-span-5 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 xl:grid-rows-3 gap-4">
                    <div className="glass p-6 group hover:border-padel-primary/50 transition-all cursor-pointer flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                            Gestión de Pistas <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </h3>
                        <p className="text-sm text-gray-400">Optimiza la ocupación con nuestra asignación inteligente.</p>
                    </div>

                    <div className="glass p-6 group hover:border-padel-primary/50 transition-all cursor-pointer flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                            Brackets en Vivo <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </h3>
                        <p className="text-sm text-gray-400">Resultados instantáneos y actualización automática para todos.</p>
                    </div>

                    <Link href="/expenses" className="glass p-6 group hover:border-padel-primary/50 transition-all cursor-pointer flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-2 flex items-center justify-between">
                            Control de Gastos <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </h3>
                        <p className="text-sm text-gray-400">Lleva la contabilidad: inscripciones, premios y gastos operativos.</p>
                    </Link>
                </div>
            </div>

            {/* Subtle Footer */}
            Optimizado para iPad Landscape • SMART PADEL Pro v1.0
        </div>
    );
}
