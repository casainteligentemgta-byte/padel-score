'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Calendar,
    MapPin,
    Search,
    Plus,
    Filter,
    MoreVertical,
    ExternalLink,
    Settings,
    Trash2,
    Zap,
    Users,
    Activity,
    ChevronRight,
    ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/formatters';

export default function AdminTournamentsPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
            return;
        }
        if (isAdmin) {
            loadTournaments();
        }
    }, [isAdmin, authLoading]);

    const loadTournaments = async () => {
        setLoading(true);
        try {
            const data = await dataService.listAllTournaments();
            setTournaments(data);
        } catch (error) {
            console.error('Error loading tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el torneo "${name}"? Esta acción eliminará también todos los partidos asociados.`)) return;

        try {
            await dataService.deleteTournament(id);
            setTournaments(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert('Error al eliminar el torneo');
        }
    };

    const filteredTournaments = tournaments.filter(t => {
        const matchesSearch = (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (authLoading || (!isAdmin && authLoading)) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
                <Zap className="w-12 h-12 text-[#ccff00] animate-pulse" />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
                <div className="max-w-md text-center">
                    <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-20" />
                    <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-4">Acceso Denegado</h2>
                    <p className="text-gray-500">Este panel es de uso exclusivo para Administradores.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white p-6 md:p-10 font-sans">
            {/* Header section */}
            <header className="mb-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-5 h-5 text-[#ccff00]" />
                            <span className="text-[10px] font-black italic uppercase tracking-[0.4em] text-[#ccff00]">Gestión de Competencias</span>
                        </div>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                            CONTROL DE <span className="text-[#ccff00]">TORNEOS</span>
                        </h1>
                    </div>

                    <Link
                        href="/admin/master-generator"
                        className="bg-[#ccff00] text-black px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(204,255,0,0.2)]"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Torneo Maestro
                    </Link>
                </div>

                {/* Filters/Search Bar */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#ccff00] transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, categoría o club..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-[#ccff00]/50 transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-xs font-black italic uppercase tracking-widest focus:outline-none focus:border-[#ccff00]/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="ALL">TODOS LOS ESTADOS</option>
                                <option value="Programado">PROGRAMADOS</option>
                                <option value="En Curso">EN CURSO</option>
                                <option value="Finalizado">FINALIZADOS</option>
                            </select>
                        </div>
                        <button
                            onClick={loadTournaments}
                            className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all group"
                        >
                            <Activity className={`w-5 h-5 text-gray-500 group-hover:text-[#ccff00] ${loading ? 'animate-spin text-[#ccff00]' : ''}`} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Tournaments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredTournaments.map((t, idx) => (
                        <motion.div
                            key={t.id}
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-[#111] border border-white/5 rounded-[2.5rem] p-6 flex flex-col hover:border-[#ccff00]/20 transition-all group relative overflow-hidden"
                        >
                            {/* Decorative background intensity */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ccff00]/5 rounded-full blur-[60px] group-hover:bg-[#ccff00]/10 transition-all" />

                            {/* Card Header: Category & Type */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col">
                                    <div className="px-3 py-1 bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-lg inline-flex mb-2">
                                        <span className="text-[9px] font-black italic uppercase tracking-widest text-[#ccff00]">
                                            {t.category || 'Categoría Libres'}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter line-clamp-2 leading-tight">
                                        {t.name}
                                    </h3>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${t.status === 'En Curso' ? 'bg-[#ccff00] shadow-[0_0_15px_#ccff00]' : t.status === 'Finalizado' ? 'bg-gray-600' : 'bg-blue-500 animate-pulse'}`} />
                            </div>

                            {/* Info list */}
                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Calendar className="w-4 h-4 text-[#ccff00]/50" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight">
                                        {formatDate(t.startDate)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <MapPin className="w-4 h-4 text-[#ccff00]/50" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight">
                                        {t.complexName || 'Sede Margarita'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-500">
                                    <Users className="w-4 h-4 text-[#ccff00]/50" />
                                    <span className="text-[11px] font-bold uppercase tracking-tight">
                                        {t.teams?.length || 0} Parejas Inscriptas
                                    </span>
                                </div>
                            </div>

                            {/* Stats mini bar */}
                            <div className="grid grid-cols-2 gap-2 mb-8">
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col">
                                    <span className="text-[8px] font-black italic text-gray-600 uppercase tracking-widest">Estado</span>
                                    <span className="text-[10px] font-black italic uppercase text-white truncate">{t.status || 'Programado'}</span>
                                </div>
                                <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col">
                                    <span className="text-[8px] font-black italic text-gray-600 uppercase tracking-widest">Formato</span>
                                    <span className="text-[10px] font-black italic uppercase text-white truncate">{t.type || 'AMERICANO'}</span>
                                </div>
                            </div>

                            {/* Action layout */}
                            <div className="mt-auto flex gap-3">
                                <Link
                                    href={`/admin/tournaments/${t.id}/master`}
                                    className="flex-1 bg-white text-black py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Gestionar
                                </Link>
                                <button
                                    onClick={() => handleDelete(t.id, t.name)}
                                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <Link
                                    href={`/tournaments/${t.id}`}
                                    target="_blank"
                                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-gray-500 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-all active:scale-95"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredTournaments.length === 0 && !loading && (
                    <div className="col-span-full py-40 border-4 border-dashed border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center">
                        <Trophy className="w-20 h-20 text-white/5 mb-6" />
                        <h3 className="text-2xl font-black italic uppercase text-white/20 tracking-tighter">No se encontraron torneos</h3>
                        <p className="text-gray-600 mt-2 font-medium">Crea tu primer torneo maestro para comenzar.</p>
                        <Link
                            href="/admin/master-generator"
                            className="mt-8 text-[#ccff00] border border-[#ccff00]/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-[0.2em] hover:bg-[#ccff00]/5 transition-all"
                        >
                            Ir al Generador
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
