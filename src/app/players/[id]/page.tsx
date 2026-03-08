'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Trophy,
    Calendar,
    Settings,
    Edit2,
    ArrowLeft,
    Phone,
    Instagram,
    Mail,
    Award,
    Activity,
    Users,
    RefreshCw,
    Shirt,
    Footprints,
    HeartPulse,
    Stethoscope,
    AlertCircle,
    Star,
    Target,
    Zap,
    Share2,
    ShieldCheck,
    Dna,
    ArrowRight,
    MapPin,
    CalendarDays
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import BouncingBall from '@/components/BouncingBall';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [playerStats, setPlayerStats] = useState<any>(null);

    useEffect(() => {
        const loadPlayer = async () => {
            if (!id) return;
            try {
                const data = await dataService.getParticipant(id);
                if (data) {
                    setPlayer(data);
                    // Fetch real stats
                    const statsData = await dataService.getPlayerStats(id);
                    if (statsData) setPlayerStats(statsData);
                } else {
                    router.push('/players');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (!authLoading) loadPlayer();
    }, [id, authLoading, router]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Perfil de ${player.name} en Smart Padel`,
                    text: `Mira el perfil de ${player.name} ${player.lastName} en Smart Padel Experience.`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('¡Enlace de perfil copiado al portapapeles!');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
                    <RefreshCw className="w-6 h-6 text-padel-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
            </div>
        );
    }

    if (!player) return null;

    const canEdit = isAdmin || (user && player.ownerId === user.uid);

    // Mock stats for visualization - these will be populated by calculations later
    const stats = [
        { label: 'RANK TOTAL', val: playerStats?.ranking || '#142', color: 'text-blue-400', icon: Award },
        { label: 'GANADOS', val: playerStats?.won.toString().padStart(2, '0') || '00', color: 'text-padel-primary', icon: Trophy },
        { label: 'EFECTIVIDAD', val: playerStats?.effectiveness || '0%', color: 'text-yellow-400', icon: Zap },
        { label: 'RACHA', val: playerStats?.streak || '0-', color: 'text-emerald-400', icon: Activity },
        { label: 'JUGADOS', val: playerStats?.played.toString().padStart(2, '0') || '00', color: 'text-zinc-500', icon: Target },
        { label: 'PERDIDOS', val: playerStats?.lost.toString().padStart(2, '0') || '00', color: 'text-red-400', icon: AlertCircle },
    ];

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit relative overflow-hidden">
            <Sidebar />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-padel-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

            <div className="ipad-scroll-area !pr-0">
                {/* Header Section - Modern and Glassy */}
                <header className="sticky top-0 z-[60] bg-[#080808]/40 backdrop-blur-xl border-b border-white/5">
                    <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between ml-20 md:ml-24">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-400 hover:text-white"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="hidden sm:flex flex-col">
                                <h1 className="text-sm font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                                    Perfil <span className="text-padel-primary">Pro</span>
                                </h1>
                                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest italic">IDENTIDAD SMART PADEL</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleShare}
                                className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-zinc-400 hover:text-padel-primary"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            {canEdit && (
                                <button
                                    onClick={() => router.push(`/players/register?edit=${player.id}`)}
                                    className="h-10 px-4 md:h-11 md:px-6 rounded-2xl bg-padel-primary text-black font-black uppercase italic tracking-tighter text-[10px] md:text-xs shadow-[0_10px_25px_rgba(204,255,0,0.3)] hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    <span>EDITAR PERFIL</span>
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <main className="max-w-5xl mx-auto px-6 py-10 space-y-10 pb-32">
                    {/* Primary Identity Card */}
                    <div className="relative">
                        <motion.section
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/40 border border-white/5 p-10 md:p-12 rounded-[50px] backdrop-blur-3xl overflow-hidden shadow-2xl relative"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-padel-primary/10 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-10 items-center md:items-start relative z-10">
                                {/* Photo Profile with Glow */}
                                <div className="relative shrink-0">
                                    <div className="w-48 h-48 md:w-56 md:h-56 rounded-[50px] border-4 border-zinc-800 p-1.5 bg-zinc-800 shadow-3xl overflow-hidden group/photo">
                                        <div className="w-full h-full rounded-[42px] overflow-hidden bg-zinc-900 relative">
                                            {player.photo ? (
                                                <img src={player.photo} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                                                    <User className="w-20 h-20 text-zinc-800" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-16 h-16 rounded-2xl bg-padel-primary text-black flex flex-col items-center justify-center shadow-2xl z-20 rotate-12 border-4 border-[#080808]">
                                        <span className="text-[7px] font-black uppercase italic">Nivel</span>
                                        <span className="text-2xl font-black italic -mt-1">{player.level || '4'}</span>
                                    </div>
                                </div>

                                {/* Identity Info */}
                                <div className="flex-1 text-center md:text-left space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                                            <span className="text-[9px] font-black bg-padel-primary/20 text-padel-primary border border-padel-primary/30 px-4 py-1 rounded-full uppercase tracking-widest italic">
                                                JUGADOR SMART PRO
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 justify-center md:justify-start">
                                            <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] truncate">
                                                {player.name} <span className="text-padel-primary drop-shadow-[0_0_15px_rgba(204,255,0,0.6)]">{player.lastName}</span>
                                            </h2>
                                            {canEdit && (
                                                <button
                                                    onClick={() => router.push(`/players/register?edit=${player.id}`)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-padel-primary/20 border border-white/10 hover:border-padel-primary/50 transition-all text-zinc-500 hover:text-padel-primary group mb-1 shrink-0"
                                                    title="Editar perfil"
                                                >
                                                    <Edit2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start text-zinc-400">
                                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                                <Target className="w-3 h-3 text-blue-400" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{player.position || 'Drive'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                                <CalendarDays className="w-3 h-3 text-zinc-500" />
                                                <span className="text-[9px] font-bold uppercase tracking-widest">{player.birthDate || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Social Connectors */}
                                    <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                                        {player.instagram && (
                                            <a
                                                href={`https://instagram.com/${String(player.instagram).replace('@', '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="h-10 px-4 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center gap-2 hover:scale-105 transition-all text-purple-400 group"
                                            >
                                                <Instagram className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest italic">@{String(player.instagram).replace('@', '')}</span>
                                            </a>
                                        )}
                                        {player.phone && (
                                            <a
                                                href={`https://wa.me/${player.phone.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="h-10 px-4 rounded-xl bg-emerald-600/10 border border-emerald-500/20 flex items-center gap-2 hover:scale-105 transition-all text-emerald-400 group"
                                            >
                                                <Phone className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest italic">WHATSAPP</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.section>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Stats Pillar */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.4em] italic mb-2 ml-4 flex items-center gap-2">
                                <Activity className="w-2.5 h-2.5 text-padel-primary" /> ESTADÍSTICAS
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((s) => (
                                    <div key={s.label} className="bg-zinc-900/40 border border-white/5 p-4 rounded-[30px] backdrop-blur-2xl flex flex-col items-center gap-2 hover:bg-zinc-900 transition-all group">
                                        <s.icon className={`w-4 h-4 ${s.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
                                        <span className={`text-xl font-black italic tracking-tighter ${s.color}`}>{s.val}</span>
                                        <span className="text-[7px] font-black uppercase text-zinc-600 tracking-widest">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Identity & Medical Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Medical Summary - Impactful */}
                            <section className="bg-zinc-900/40 border border-red-500/10 p-8 rounded-[40px] backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-5">
                                    <HeartPulse className="w-12 h-12 text-red-500" />
                                </div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-1 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                                    <h3 className="text-base font-black uppercase italic tracking-tighter text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">Protocolo Médico</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="bg-black/40 p-4 rounded-2xl border border-red-500/10 flex flex-col items-center justify-center gap-1">
                                        <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest italic">SANGRE</span>
                                        <span className="text-3xl font-black italic tracking-tighter text-white drop-shadow-lg">{player.bloodType || 'O+'}</span>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                            <p className="text-[8px] font-black text-red-500/80 uppercase tracking-widest italic mb-0.5">Alergias</p>
                                            <p className="text-[10px] font-bold text-zinc-400 truncate">{player.allergies || 'SIN REPORTES'}</p>
                                        </div>
                                        <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                            <p className="text-[8px] font-black text-red-500/80 uppercase tracking-widest italic mb-0.5">Condiciones</p>
                                            <p className="text-[10px] font-bold text-zinc-400 truncate">{player.medicalConditions || 'ÓPTIMO'}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Technical Info */}
                                <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-2xl space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Shirt className="w-3.5 h-3.5 text-padel-primary" />
                                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Equipación</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">FRANELA</p>
                                            <p className="text-lg font-black italic text-padel-primary">{player.suitSize || 'M'}</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">SHORT</p>
                                            <p className="text-lg font-black italic text-padel-primary">{player.shortSize || 'M'}</p>
                                        </div>
                                        <div className="bg-black/40 p-3 rounded-xl border border-white/5 text-center">
                                            <p className="text-[7px] font-black text-zinc-600 uppercase mb-0.5">EU SIZE</p>
                                            <p className="text-lg font-black italic text-padel-primary">{player.shoeSize || '--'}</p>
                                        </div>
                                    </div>
                                </section>

                                {/* Identity Card */}
                                <section className="bg-zinc-900/40 border border-white/5 p-6 rounded-[35px] backdrop-blur-2xl space-y-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Dna className="w-3.5 h-3.5 text-zinc-600" />
                                        <h3 className="text-sm font-black uppercase italic tracking-tighter text-white">Registro</h3>
                                    </div>
                                    <div className="space-y-3 text-xs font-bold">
                                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">DNI / CÉDULA</span>
                                            <span className="italic tracking-tighter">{player.dni || 'S/R'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                                            <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest italic">GÉNERO</span>
                                            <span className="italic tracking-tighter uppercase">{player.gender === 'FEMALE' ? 'FEMENINO' : 'MASCULINO'}</span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>


                    {/* Timeline / Recent Activity Placeholders */}
                    <section className="bg-[#111111]/80 border border-white/5 p-12 rounded-[50px] backdrop-blur-3xl relative overflow-hidden text-center space-y-8">
                        <div className="absolute inset-0 bg-padel-primary/5 blur-[80px] rounded-full pointer-events-none" />
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto shadow-2xl">
                            <Activity className="w-7 h-7 text-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black italic tracking-tighter text-zinc-500 uppercase">Sin Competencia Registrada</h4>
                            <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.4em] max-w-xs mx-auto italic">Historial Smart Padel en preparación</p>
                        </div>
                        <button className="h-14 px-8 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] overflow-hidden group hover:bg-white/10 transition-all flex items-center gap-3 mx-auto italic">
                            VER CRONOGRAMA PRO
                            <ArrowRight className="w-4 h-4 border-l border-white/20 pl-4 h-full flex items-center" />
                        </button>
                    </section>
                </main>
            </div>
        </div>
    );
}
