'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles,
    TrendingUp,
    Target,
    Newspaper,
    ArrowRight,
    Bot,
    Activity,
    DollarSign,
    Zap,
    Share2,
    Palette,
    Send,
    Image,
    Camera,
    Paperclip,
    X as CloseIcon
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function AgentCenter() {
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [message, setMessage] = useState('');

    const agents = [
        {
            id: 'aura',
            name: 'Aura Design',
            role: 'UX/UI & Aesthetics',
            description: 'Especialista en interfaces táctiles para iPad y Móvil. Optimiza la ergonomía y asegura un look premium y futurista.',
            icon: Palette,
            color: 'from-fuchsia-400 to-purple-600',
            glow: 'rgba(192, 38, 211, 0.5)',
            stats: ['Touch Area: 44px+', 'Aesthetics: 10/10', 'Feedback: Tactile'],
            action: 'Auditar Diseño'
        },
        {
            id: 'midas',
            name: 'Agente Midas',
            role: 'Finanzas & ROI',
            description: 'Analiza la rentabilidad de tus torneos, gastos de pelotas, pistas y utilidad neta en tiempo real.',
            icon: DollarSign,
            color: 'from-amber-400 to-orange-600',
            glow: 'rgba(251, 191, 36, 0.5)',
            stats: ['ROI: +24%', 'Gastos: $1.2k', 'Utilidad: $4.5k'],
            action: 'Analizar Finanzas'
        },
        {
            id: 'coach',
            name: 'AI Coach',
            role: 'Rendimiento Técnico',
            description: 'Detector de patrones de juego. Predice ganadores y analiza el rendimiento histórico de cada jugador.',
            icon: Target,
            color: 'from-blue-400 to-indigo-600',
            glow: 'rgba(59, 130, 246, 0.5)',
            stats: ['Precisión: 89%', 'Partidos: 450', 'Jugadores: 120'],
            action: 'Ver Perfiles AI'
        },
        {
            id: 'reporter',
            name: 'Padel Reporter',
            role: 'Social & Crónicas',
            description: 'Redacta crónicas épicas automáticamente para WhatsApp e Instagram tras finalizar cada partido.',
            icon: Newspaper,
            color: 'from-emerald-400 to-teal-600',
            glow: 'rgba(16, 185, 129, 0.5)',
            stats: ['Post: 1min', 'Vistas: +5k', 'Engagement: 12%'],
            action: 'Generar Crónica'
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 overflow-hidden relative">
            <Sidebar />

            {/* Background Tech Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-padel-primary/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 pt-12">
                {/* Header */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-4"
                    >
                        <div className="p-3 bg-padel-primary/20 rounded-2xl border border-padel-primary/30">
                            <Sparkles className="w-8 h-8 text-padel-primary" />
                        </div>
                        <h4 className="text-padel-primary font-black uppercase tracking-[0.3em] text-sm italic">Inteligencia Artificial</h4>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase mb-6"
                    >
                        CENTRO DE <span className="text-padel-primary">AGENTES</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed"
                    >
                        Potencia tu club con agentes especializados. Análisis de datos, predicciones de rendimiento y comunicación automatizada de nivel profesional.
                    </motion.p>
                </div>

                {/* Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    {agents.map((agent, index) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.3 }}
                            whileHover={{
                                y: -10,
                                transition: { duration: 0.3 }
                            }}
                            className="group relative"
                        >
                            {/* Card Glow Background */}
                            <div
                                className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10"
                                style={{ backgroundColor: agent.glow }}
                            />

                            <div className="glass h-full p-8 rounded-[2.5rem] border border-white/5 group-hover:border-white/20 transition-all flex flex-col relative overflow-hidden">
                                {/* Decorative Gradient */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${agent.color} opacity-10 blur-3xl group-hover:opacity-30 transition-opacity`} />

                                <div className="flex justify-between items-start mb-8">
                                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${agent.color} shadow-lg`}>
                                        <agent.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-padel-primary bg-padel-primary/10 px-3 py-1 rounded-full mb-2">
                                            <Activity className="w-3 h-3" /> Online
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">{agent.name}</h3>
                                    <p className="text-padel-primary font-bold uppercase text-xs tracking-widest mb-4 italic">{agent.role}</p>
                                    <p className="text-gray-400 font-medium leading-relaxed italic">{agent.description}</p>
                                </div>

                                {/* Stats Bar */}
                                <div className="grid grid-cols-3 gap-2 mb-8">
                                    {agent.stats.map((stat) => (
                                        <div key={stat} className="bg-white/5 p-2 rounded-lg border border-white/5 text-[9px] font-black uppercase text-gray-500 text-center tracking-tighter">
                                            {stat}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <motion.button
                                        onClick={() => setSelectedAgent(agent)}
                                        whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${agent.glow}`, filter: 'brightness(1.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`w-full py-4 rounded-2xl bg-gradient-to-br ${agent.color} text-white font-black uppercase text-xs italic tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all`}
                                    >
                                        {agent.action} <ArrowRight className="w-4 h-4" />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Section - Future Expansion */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-20 glass p-10 rounded-[3rem] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
                >
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
                            <Bot className="w-10 h-10 text-gray-500" />
                            <div className="absolute inset-0 rounded-full border border-padel-primary/30 animate-ping opacity-20" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black italic uppercase text-white mb-1 tracking-tighter">¿Necesitas un Agente Personalizado?</h4>
                            <p className="text-gray-500 font-medium">Podemos entrenar un agente específico para las necesidades de tu club.</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255,255,255,0.1)' }}
                        className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest flex items-center gap-3"
                    >
                        Solicitar Agente <Zap className="w-4 h-4 fill-current" />
                    </motion.button>
                </motion.div>
            </div>

            {/* Agent Chat Dialog */}
            <AnimatePresence>
                {selectedAgent && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedAgent(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                        />

                        {/* Modal Container */}
                        <div className="fixed inset-0 flex items-center justify-center z-[160] p-4 md:p-10 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                                className="w-full max-w-4xl h-[80vh] bg-[#0d0d0d] border border-white/10 rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col pointer-events-auto relative"
                            >
                                {/* Modal Header */}
                                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                    <div className="flex items-center gap-6">
                                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${selectedAgent.color} shadow-lg shadow-black/40`}>
                                            <selectedAgent.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white flex items-center gap-3">
                                                Interacción con {selectedAgent.name}
                                                <span className="w-2 h-2 bg-padel-primary rounded-full animate-pulse shadow-[0_0_10px_#ccff00]" />
                                            </h2>
                                            <p className="text-padel-primary font-bold uppercase text-[10px] tracking-widest italic">{selectedAgent.role}</p>
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setSelectedAgent(null)}
                                        className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                                    >
                                        <CloseIcon className="w-6 h-6" />
                                    </motion.button>
                                </div>

                                {/* Chat Area */}
                                <div className="flex-1 p-8 overflow-y-auto flex flex-col items-center justify-center text-center opacity-40">
                                    <selectedAgent.icon className="w-20 h-20 mb-6 text-gray-600 animate-float" />
                                    <p className="text-xl font-black italic uppercase tracking-tighter mb-2">Canal de Comunicación AI</p>
                                    <p className="text-gray-500 max-w-xs text-sm">Describe tu solicitud o adjunta archivos (fotos, reportes, datos de pistas) para procesar.</p>
                                </div>

                                {/* Interaction Bar */}
                                <div className="p-8 border-t border-white/5 bg-white/[0.01]">
                                    <div className="flex items-end gap-4 max-w-5xl mx-auto glass p-2 rounded-3xl border border-white/10">
                                        {/* Attachments */}
                                        <div className="flex gap-2 p-1">
                                            <div className="relative">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400"
                                                >
                                                    <Image className="w-5 h-5" />
                                                </motion.button>
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                whileTap={{ scale: 0.9 }}
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400"
                                            >
                                                <Camera className="w-5 h-5" />
                                            </motion.button>
                                            <div className="relative">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-gray-400"
                                                >
                                                    <Paperclip className="w-5 h-5" />
                                                </motion.button>
                                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                                            </div>
                                        </div>

                                        {/* Text Input */}
                                        <div className="flex-1 relative">
                                            <textarea
                                                rows={1}
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                placeholder={`Enviar instrucciones a ${selectedAgent.name}...`}
                                                className="w-full bg-transparent border-none text-white p-4 focus:ring-0 text-lg font-medium placeholder:text-gray-600 placeholder:italic resize-none no-scrollbar outline-none"
                                            />
                                        </div>

                                        {/* Send Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(204,255,0,0.4)' }}
                                            whileTap={{ scale: 0.9 }}
                                            className="bg-padel-primary text-black p-4 rounded-2xl flex items-center justify-center shadow-lg"
                                        >
                                            <Send className="w-6 h-6 fill-current" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Global Styles for Animations */}
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
                
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                
                .animate-float {
                    animation: float 6s ease-in-out infinite;
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
