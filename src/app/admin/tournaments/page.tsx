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
    const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
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
            const [data, counts] = await Promise.all([
                dataService.listAllTournaments(),
                dataService.getAllRegistrationCounts()
            ]);
            setTournaments(data);
            setRegistrationCounts(counts);
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
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4 text-white">
                            <Trophy className="w-10 h-10 md:w-12 md:h-12 text-[#ccff00] shrink-0" />
                            <span>CONTROL DE <span className="text-[#ccff00]">TORNEOS</span></span>
                        </h1>
                    </div>

                    {/* El botón de Nuevo Torneo Maestro ha sido removido según solicitud */}
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
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm font-medium focus:outline-none focus:border-[#ccff00]/50 transition-all placeholder:text-gray-600 text-white"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-[#111] border border-white/10 rounded-2xl py-4 pl-12 pr-10 text-xs font-black italic uppercase tracking-widest focus:outline-none focus:border-[#ccff00]/50 transition-all appearance-none cursor-pointer text-white"
                            >
                                <option value="ALL" className="bg-[#080808] text-white">TODOS LOS ESTADOS</option>
                                <option value="Programado" className="bg-[#080808] text-white">PROGRAMADOS</option>
                                <option value="En Curso" className="bg-[#080808] text-white">EN CURSO</option>
                                <option value="Finalizado" className="bg-[#080808] text-white">FINALIZADOS</option>
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

            {/* Tournaments Grid - Grouped by Event */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(() => {
                    const groups: Record<string, any[]> = {};
                    filteredTournaments.forEach(t => {
                        const key = `${t.startDate || 'no-date'}_${t.complexName || 'Margarita Padel'}`;
                        if (!groups[key]) groups[key] = [];
                        groups[key].push(t);
                    });

                    const CAT_LABEL: Record<string, string> = {
                        MAS_45: '+45',
                        MAS_50: '+50',
                        SUMA_7: 'Suma 7',
                        SUMA_8: 'Suma 8',
                        SUMA_9: 'Suma 9',
                        SUMA_10: 'Suma 10',
                        SUMA_11: 'Suma 11'
                    };

                    return Object.entries(groups).map(([key, groupTournaments], gIdx) => {
                        const CAT_LABEL: Record<string, string> = {
                            MAS_45: '+45',
                            MAS_50: '+50',
                            SUMA_7: 'Suma 7',
                            SUMA_8: 'Suma 8',
                            SUMA_9: 'Suma 9',
                            SUMA_10: 'Suma 10',
                            SUMA_11: 'Suma 11'
                        };

                        const first = groupTournaments[0];
                        const eventName = first.eventName || 'CASA INTELIGENTE';
                        const sortedCats = groupTournaments.sort((a, b) => (a.category || '').localeCompare(b.category || ''));

                        // Calcular totales del evento
                        let totalRemaining = 0;
                        const catNames: string[] = [];

                        sortedCats.forEach(t => {
                            const registered = registrationCounts[t.id] ?? 0;
                            const maxTeams = t.maxTeams ?? (t.teams?.length || 0);
                            totalRemaining += Math.max(0, maxTeams - registered);
                            catNames.push(CAT_LABEL[t.category] || t.category || 'Libres');
                        });

                        const catsString = catNames.length > 1
                            ? catNames.slice(0, -1).join(', ') + ' y ' + catNames.slice(-1)
                            : catNames[0];

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gIdx * 0.05 }}
                                className="bg-[#111] border border-white/5 rounded-[3rem] p-10 hover:border-[#ccff00]/20 transition-all group relative overflow-hidden flex flex-col h-fit"
                            >
                                {/* Decorative background intensity */}
                                <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#ccff00]/5 rounded-full blur-[100px] group-hover:bg-[#ccff00]/10 transition-all" />

                                {/* Event Basic Info */}
                                <div className="flex flex-col mb-8 relative z-10 px-2">
                                    <span className="text-[10px] font-black italic uppercase tracking-[0.4em] text-[#ccff00]/60 mb-2">TORNEO.</span>
                                    <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none mb-3 group-hover:text-[#ccff00] transition-colors">
                                        {eventName}
                                    </h2>
                                    <div className="flex items-center gap-4 text-white/40">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-[#ccff00]/60" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {formatDate(first.startDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-[#ccff00]/60" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                                {first.complexName || 'Casa Inteligente'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stacked List Section */}
                                <div className="flex flex-col gap-4 relative z-10">
                                    <div className="bg-[#ccff00] border border-[#ccff00]/20 rounded-2xl p-4 px-6 flex items-center justify-between gap-4 shadow-lg group/master">
                                        <div className="flex items-center gap-6 text-black">
                                            <div className="flex flex-col items-center gap-0.5 shrink-0">
                                                <Trophy className="w-4 h-4 opacity-40" />
                                                <h4 className="text-[11px] font-black italic uppercase tracking-tighter">TODAS</h4>
                                            </div>

                                            <div className="hidden md:block w-px h-10 bg-black/10 shrink-0" />

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-4 opacity-60">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase">{formatDate(first.startDate)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3 h-3" />
                                                        <span className="text-[9px] font-bold uppercase truncate max-w-[120px]">{first.complexName || 'Casa Inteligente'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 font-black italic uppercase">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] tracking-tight">
                                                        {totalRemaining} parejas por inscribirse
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/admin/tournaments/${first.id}/master`}
                                            className="px-6 py-2.5 bg-black text-[#ccff00] rounded-xl flex items-center gap-2 text-[10px] font-black italic uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shrink-0"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Gestionar
                                        </Link>
                                    </div>

                                    <div className="mt-4 px-2 flex items-center gap-4">
                                        <div className="h-px flex-1 bg-white/5"></div>
                                        <span className="text-[9px] font-black italic uppercase text-white/20 tracking-[0.4em]">Detalle por Categoría</span>
                                        <div className="h-px flex-1 bg-white/5"></div>
                                    </div>

                                    {/* Stacked Categories Section */}
                                    <div className="flex flex-col gap-4 relative z-10">
                                        {sortedCats.map(t => {
                                            const catName = CAT_LABEL[t.category] || t.category || 'Categoría';
                                            const registered = registrationCounts[t.id] ?? 0;
                                            const maxTeams = t.maxTeams ?? (t.teams?.length || 0);
                                            const remaining = Math.max(0, maxTeams - registered);

                                            return (
                                                <div key={t.id} className="bg-black/40 border border-white/5 rounded-2xl p-2.5 px-6 hover:border-white/10 transition-all flex items-center justify-between gap-4 group/item">
                                                    <div className="flex items-center gap-5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${t.status === 'En Curso' ? 'bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.4)]' : t.status === 'Finalizado' ? 'bg-gray-600' : 'bg-blue-500'}`} />
                                                        <div>
                                                            <h4 className="text-sm font-black italic uppercase text-white tracking-tighter leading-none mb-1">
                                                                {catName}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-4">
                                                                <div className="flex items-center gap-1 opacity-40">
                                                                    <Users className="w-3 h-3" />
                                                                    <span className="text-[9px] font-bold uppercase whitespace-nowrap">
                                                                        {remaining} cupos
                                                                    </span>
                                                                </div>
                                                                <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                                                                <span className="text-[9px] font-black italic uppercase text-[#ccff00]/30 tracking-widest">
                                                                    {t.type || 'ROUND ROBIN'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1.5 h-fit shrink-0">
                                                        <Link
                                                            href={`/tournaments/${t.id}`}
                                                            target="_blank"
                                                            className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-all active:scale-95"
                                                            title="Ver vista pública"
                                                        >
                                                            <ExternalLink className="w-3 h-3" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(t.id, `${eventName} - ${catName}`)}
                                                            className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all active:scale-95"
                                                            title="Eliminar categoría"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    });
                })()}

                {filteredTournaments.length === 0 && !loading && (
                    <div className="col-span-full py-40 bg-white/5 border border-white/5 rounded-[4rem] flex flex-col items-center justify-center text-center">
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
