'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    UserPlus,
    Search,
    Trash2,
    Mail,
    Phone,
    X,
    CheckCircle2,
    RefreshCw,
    FolderPlus,
    ChevronRight,
    LayoutGrid,
    Target,
    Camera
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { Participant, TournamentCategory, Group } from '@/types/tournament';
import Link from 'next/link';

export default function ParticipantsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'players' | 'groups'>('players');
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form states
    const [playerFormData, setPlayerFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        photo: '',
        category: TournamentCategory.CUARTA,
        gender: 'MALE' as 'MALE' | 'FEMALE'
    });

    const [groupFormData, setGroupFormData] = useState({
        name: '',
        description: '',
        participantIds: [] as string[]
    });

    useEffect(() => {
        if (user) loadData();
    }, [user]);

    const loadData = async () => {
        try {
            const [pData, gData] = await Promise.all([
                dataService.getMyParticipants(user!.uid),
                dataService.getMyGroups(user!.uid)
            ]);
            setParticipants(pData as Participant[]);
            setGroups(gData as Group[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dataService.addParticipant(playerFormData, user!.uid);
            setIsPlayerModalOpen(false);
            setPlayerFormData({
                name: '',
                lastName: '',
                email: '',
                phone: '',
                photo: '',
                category: TournamentCategory.CUARTA,
                gender: 'MALE'
            });
            loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGroupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await dataService.addGroup(groupFormData, user!.uid);
            setIsGroupModalOpen(false);
            setGroupFormData({ name: '', description: '', participantIds: [] });
            loadData();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeletePlayer = async (id: string) => {
        if (!confirm('¿Eliminar jugador?')) return;
        await dataService.deleteParticipant(id);
        loadData();
    };

    const handleDeleteGroup = async (id: string) => {
        if (!confirm('¿Eliminar grupo?')) return;
        await dataService.deleteGroup(id);
        loadData();
    };

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12 font-outfit">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <Link href="/" className="text-padel-primary text-xs font-black uppercase tracking-[0.3em] mb-2 block hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                            ← Inicio
                        </Link>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                            Comunidad <span className="text-padel-primary">Padel</span>
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">Organiza tus jugadores y crea grupos estratégicos.</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsPlayerModalOpen(true)}
                            className="bg-white/5 border border-white/10 text-white px-6 py-4 rounded-2xl font-black uppercase italic text-xs hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <UserPlus className="w-4 h-4 text-padel-primary" /> Nuevo Jugador
                        </button>
                        <button
                            onClick={() => setIsGroupModalOpen(true)}
                            className="bg-padel-primary text-black px-6 py-4 rounded-2xl font-black uppercase italic text-xs hover:scale-105 transition-all shadow-lg shadow-padel-primary/20 flex items-center gap-2"
                        >
                            <FolderPlus className="w-4 h-4" /> Crear Grupo
                        </button>
                    </div>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-4 p-1 bg-white/5 rounded-2xl border border-white/5 w-fit">
                    <button
                        onClick={() => setActiveTab('players')}
                        className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${activeTab === 'players' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Users className="w-3.5 h-3.5" /> Jugadores
                    </button>
                    <button
                        onClick={() => setActiveTab('groups')}
                        className={`px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center gap-2 ${activeTab === 'groups' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                    >
                        <LayoutGrid className="w-3.5 h-3.5" /> Grupos / Equipos
                    </button>
                </div>

                {/* Sub-Header: Search & Stats */}
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="glass p-6 rounded-3xl border-white/5 md:col-span-3 flex items-center gap-4">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder={`Buscar ${activeTab === 'players' ? 'jugador' : 'grupo'}...`}
                            className="bg-transparent border-none outline-none w-full text-lg font-medium placeholder:text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-center text-center">
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">Total {activeTab === 'players' ? 'Padrón' : 'Grupos'}</p>
                        <p className="text-3xl font-black text-padel-primary italic">
                            {activeTab === 'players' ? participants.length : groups.length}
                        </p>
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode='wait'>
                    {activeTab === 'players' ? (
                        <motion.div
                            key="players-grid"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredParticipants.map((p, idx) => (
                                <div key={p.id} className="glass rounded-[2rem] p-8 border-white/5 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeletePlayer(p.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-start gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-padel-primary/20 to-transparent flex items-center justify-center border border-padel-primary/20">
                                            <Users className="w-8 h-8 text-padel-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold truncate pr-8">{p.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 bg-white/5 text-[9px] font-black rounded-md text-gray-400 border border-white/5 uppercase">
                                                    {p.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 space-y-3">
                                        {p.email && <div className="flex items-center gap-3 text-sm text-gray-500 truncate"><Mail className="w-4 h-4 shrink-0" /> {p.email}</div>}
                                        {p.phone && <div className="flex items-center gap-3 text-sm text-gray-500"><Phone className="w-4 h-4 shrink-0" /> {p.phone}</div>}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="groups-grid"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {filteredGroups.map(g => (
                                <div key={g.id} className="glass rounded-[2rem] p-8 border-white/5 group relative overflow-hidden bg-white/[0.02]">
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleDeleteGroup(g.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-padel-primary flex items-center justify-center text-black">
                                            <LayoutGrid className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tight">{g.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{g.participantIds.length} Integrantes</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 h-10">{g.description || 'Sin descripción.'}</p>
                                    <div className="flex -space-x-3 overflow-hidden">
                                        {g.participantIds.slice(0, 5).map((pid, i) => (
                                            <div key={pid} className="inline-block h-8 w-8 rounded-full border-2 border-[#111] bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                                                {i + 1}
                                            </div>
                                        ))}
                                        {g.participantIds.length > 5 && (
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-[#111] bg-padel-primary text-black text-[10px] font-black">
                                                +{g.participantIds.length - 5}
                                            </div>
                                        )}
                                    </div>
                                    <button className="mt-8 w-full py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-padel-primary group-hover:text-black group-hover:border-padel-primary transition-all flex items-center justify-center gap-2">
                                        Ver Integrantes <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setIsGroupModalOpen(true)}
                                className="border-2 border-dashed border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-padel-primary/30 hover:bg-padel-primary/5 transition-all text-gray-600 hover:text-padel-primary group"
                            >
                                <FolderPlus className="w-10 h-10 group-hover:scale-110 transition-transform" />
                                <span className="font-black uppercase text-xs tracking-widest italic">Crear Nuevo Grupo</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modal Jugador */}
            <AnimatePresence>
                {isPlayerModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPlayerModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-xl glass rounded-[3rem] p-10 border-white/10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Ficha del <span className="text-padel-primary">Jugador</span></h2>
                            <form onSubmit={handlePlayerSubmit} className="space-y-6">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-padel-primary/50">
                                            {playerFormData.photo ? (
                                                <img src={playerFormData.photo} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="w-8 h-8 text-gray-700 group-hover:text-padel-primary" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setPlayerFormData({ ...playerFormData, photo: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Nombre</label>
                                        <input required type="text" placeholder="Ej: Juan" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/50 font-bold" value={playerFormData.name} onChange={e => setPlayerFormData({ ...playerFormData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Apellido</label>
                                        <input required type="text" placeholder="Ej: Pérez" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/50 font-bold" value={playerFormData.lastName} onChange={e => setPlayerFormData({ ...playerFormData, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Categoría</label>
                                        <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/50 font-bold appearance-none" value={playerFormData.category} onChange={e => setPlayerFormData({ ...playerFormData, category: e.target.value as TournamentCategory })}>
                                            {Object.values(TournamentCategory).map(cat => <option key={cat} value={cat} className="bg-black">{cat}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Género</label>
                                        <div className="flex gap-2">
                                            {(['MALE', 'FEMALE'] as const).map(g => (
                                                <button key={g} type="button" onClick={() => setPlayerFormData({ ...playerFormData, gender: g })} className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase border ${playerFormData.gender === g ? 'bg-padel-primary text-black border-padel-primary shadow-lg' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                                                    {g === 'MALE' ? 'H' : 'M'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button disabled={isSubmitting} type="submit" className="w-full bg-padel-primary text-black py-5 rounded-[2rem] font-black uppercase italic text-lg shadow-2xl shadow-padel-primary/30 mt-6 flex items-center justify-center gap-3">
                                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <CheckCircle2 className="w-6 h-6" />} Confirmar Registro
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal Grupo */}
            <AnimatePresence>
                {isGroupModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsGroupModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl glass rounded-[3rem] p-10 border-white/10">
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-8">Crear Nuevo <span className="text-padel-primary">Grupo</span></h2>
                            <form onSubmit={handleGroupSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Nombre del Grupo/Equipo</label>
                                    <input required type="text" placeholder="Ej: Americano de los Viernes" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/50 font-bold" value={groupFormData.name} onChange={e => setGroupFormData({ ...groupFormData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Descripción</label>
                                    <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/50 font-bold h-24 resize-none" placeholder="Opcional..." value={groupFormData.description} onChange={e => setGroupFormData({ ...groupFormData, description: e.target.value })} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-4">Seleccionar Integrantes ({groupFormData.participantIds.length})</label>
                                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {participants.map(p => {
                                            const isSelected = groupFormData.participantIds.includes(p.id);
                                            return (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => {
                                                        const newIds = isSelected
                                                            ? groupFormData.participantIds.filter(id => id !== p.id)
                                                            : [...groupFormData.participantIds, p.id];
                                                        setGroupFormData({ ...groupFormData, participantIds: newIds });
                                                    }}
                                                    className={`p-4 rounded-xl text-left border transition-all flex items-center justify-between ${isSelected ? 'bg-padel-primary/10 border-padel-primary/50' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                                >
                                                    <span className={`text-[10px] font-bold uppercase truncate ${isSelected ? 'text-padel-primary' : 'text-gray-400'}`}>{p.name}</span>
                                                    {isSelected && <Target className="w-3 h-3 text-padel-primary" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button disabled={isSubmitting || !groupFormData.name} type="submit" className="w-full bg-padel-primary text-black py-5 rounded-[2rem] font-black uppercase italic text-lg shadow-2xl shadow-padel-primary/30 mt-6 flex items-center justify-center gap-3">
                                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <LayoutGrid className="w-6 h-6" />} Guardar Grupo
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
