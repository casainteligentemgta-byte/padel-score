'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Trophy,
    Calendar,
    Settings,
    Edit2,
    Trash2,
    ArrowLeft,
    Phone,
    Instagram,
    Mail,
    Award,
    Activity,
    Users,
    ChevronRight,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [player, setPlayer] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlayer = async () => {
            if (!id) return;
            try {
                const data = await dataService.getParticipant(id);
                if (data) {
                    setPlayer(data);
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

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (!player) return null;

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <div className="ipad-scroll-area pb-40">
                {/* Header / Banner */}
                <div className="relative h-48 md:h-64 rounded-b-[40px] overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-padel-primary/20 to-black/80" />
                    <div className="absolute inset-0 backdrop-blur-3xl" />
                    <Link
                        href="/players"
                        className="absolute top-8 left-28 md:left-32 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors z-10"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>

                {/* Profile Card */}
                <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
                    <div className="glass rounded-[40px] p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-padel-primary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            {/* Photo */}
                            <div className="relative">
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white/5 border-4 border-[#0a0a0a] overflow-hidden shadow-2xl">
                                    {player.photo ? (
                                        <img src={player.photo} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                                            <User className="w-16 h-16 text-gray-700" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#ccff00] flex items-center justify-center text-black border-4 border-[#0a0a0a] shadow-lg">
                                    <Award className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                                            {player.name} <span className="text-padel-primary">{player.lastName}</span>
                                        </h1>
                                        <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                                            <span className="px-3 py-1 rounded-full bg-padel-primary/10 text-padel-primary text-xs font-black uppercase tracking-widest italic">
                                                Nivel {player.level || '4'}
                                            </span>
                                            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-black uppercase tracking-widest italic">
                                                {player.position || 'Ambos'}
                                            </span>
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => router.push(`/players?edit=${player.id}`)}
                                            className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl flex items-center gap-3 transition-all"
                                        >
                                            <Edit2 className="w-5 h-5 text-padel-primary" />
                                            <span className="text-sm font-black uppercase italic tracking-tighter">Editar Perfil</span>
                                        </button>
                                    )}
                                </div>

                                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1 flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> Estado
                                        </p>
                                        <p className="font-bold text-padel-primary uppercase italic">Activo</p>
                                    </div>
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1 flex items-center gap-2">
                                            <Trophy className="w-3 h-3" /> Torneos
                                        </p>
                                        <p className="font-bold uppercase italic">0 Jugados</p>
                                    </div>
                                    <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest mb-1 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Ingreso
                                        </p>
                                        <p className="font-bold uppercase italic">{new Date(player.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact info grid */}
                        <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em] italic">Información Personal</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-padel-primary group-hover:text-black transition-all">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Teléfono</p>
                                            <p className="text-sm font-bold tracking-tight">{player.phone || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-padel-primary group-hover:text-black transition-all">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Correo</p>
                                            <p className="text-sm font-bold tracking-tight">{player.email || player.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-padel-primary group-hover:text-black transition-all">
                                            <Instagram className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Instagram</p>
                                            <p className="text-sm font-bold tracking-tight">{player.instagram ? `@${player.instagram.replace('@', '')}` : 'No vinculado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase text-gray-500 tracking-[0.3em] italic">Identificación</h3>
                                <div className="space-y-4">
                                    <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                        <div className="flex justify-between items-center mb-4">
                                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest italic">Documento Nacional</p>
                                            <Settings className="w-4 h-4 text-gray-700" />
                                        </div>
                                        <p className="text-4xl font-black italic tracking-tighter text-white">
                                            {player.dni || 'SIN DNI'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats / History Placeholder */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass rounded-[32px] p-8 border border-white/10">
                            <h3 className="text-sm font-black uppercase text-white tracking-widest italic mb-6 flex items-center gap-3">
                                <Users className="w-5 h-5 text-padel-primary" /> Compañeros Frecuentes
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-center h-24 text-gray-600 italic text-sm border-2 border-dashed border-white/5 rounded-2xl">
                                    No hay datos históricos suficientes
                                </div>
                            </div>
                        </div>
                        <div className="glass rounded-[32px] p-8 border border-white/10">
                            <h3 className="text-sm font-black uppercase text-white tracking-widest italic mb-6 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-padel-primary" /> Rendimiento
                            </h3>
                            <div className="space-y-4">
                                <div className="h-2 flex bg-white/5 rounded-full overflow-hidden">
                                    <div className="w-3/4 bg-padel-primary" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Win Rate</span>
                                    <span className="text-xs font-black italic text-padel-primary uppercase tracking-tighter">75%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="mt-16 pt-8 border-t border-white/5 text-center px-6">
                    <p className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-700 italic max-w-xl mx-auto">
                        Este perfil de jugador es exclusivo para administradores de PADEL SMART Pro.
                        Cualquier modificación queda registrada en el sistema central.
                    </p>
                </footer>
            </div>

        </div>
    );
}
