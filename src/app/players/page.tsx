'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import {
    Users,
    UserPlus,
    Search,
    Trash2,
    ExternalLink,
    RefreshCw,
    Edit2,
    X,
    Save,
    Camera
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import { Suspense } from 'react';
import { formatDNI } from '@/lib/formatters';

import Sidebar from '@/components/Sidebar';

import { useSearchParams } from 'next/navigation';

function PlayersListContent() {
    const { user, loading: authLoading, isAdmin } = useAuth();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPlayer, setEditingPlayer] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    useEffect(() => {
        const loadPlayers = async () => {
            if (user) {
                try {
                    // Si es admin, traemos TODOS los participantes del sistema
                    const data = isAdmin
                        ? await dataService.getAllParticipants()
                        : await dataService.getMyParticipants(user.uid);
                    setPlayers(data);
                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }
        };
        if (!authLoading && user) loadPlayers();
        else if (!authLoading && !user) setLoading(false);
    }, [user, authLoading, isAdmin]);

    useEffect(() => {
        if (editId && players.length > 0) {
            const p = players.find(p => p.id === editId);
            if (p) {
                setEditingPlayer({ ...p });
                setIsEditModalOpen(true);
            }
        }
    }, [editId, players]);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este jugador? Esta acción es irreversible.')) return;
        try {
            await dataService.deleteParticipant(id);
            setPlayers(players.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    };

    const handleEdit = (player: any) => {
        setEditingPlayer({ ...player });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!editingPlayer) return;
        setSaving(true);
        try {
            await dataService.updateParticipant(editingPlayer.id, editingPlayer);
            setPlayers(players.map(p => p.id === editingPlayer.id ? editingPlayer : p));
            setIsEditModalOpen(false);
            setEditingPlayer(null);
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const filteredPlayers = players.filter(p =>
        (p.name + ' ' + p.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.dni || '').includes(searchTerm)
    );

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 flex-shrink-0 pl-24 md:pl-28">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                        <span className="text-padel-primary">Jugadores</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Gestiona los perfiles y estadísticas de tus jugadores.</p>
                </div>
                <Link
                    href="/players/register"
                    className="bg-padel-primary text-black px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:scale-105 transition-transform uppercase italic"
                >
                    REGISTRAR NUEVO <UserPlus className="w-5 h-5" />
                </Link>
            </header>

            <div className="mb-8 relative flex-shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-padel-primary transition-colors text-sm font-bold italic"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="ipad-scroll-area pb-40">
                <div className="glass overflow-hidden overflow-x-auto">
                    <table className="w-full text-left font-public-sans">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Jugador</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Nivel/Pos</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Contacto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic font-medium">
                                        No se encontraron jugadores que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-padel-primary/30 transition-all">
                                                    {player.photo ? (
                                                        <img src={player.photo} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users className="w-6 h-6 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{player.name} {player.lastName}</p>
                                                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{player.dni || 'SIN DNI'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-padel-primary/10 text-padel-primary text-[10px] font-bold w-fit uppercase italic tracking-tighter">
                                                    Nivel {player.level || '4'}
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">{player.position}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">
                                            <div className="space-y-1">
                                                <p className="text-gray-300">{player.phone || 'S/N'}</p>
                                                <p className="text-gray-500 italic">{player.instagram ? `@${player.instagram}` : player.email || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDelete(player.id)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(player)}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-padel-primary/10 text-padel-primary hover:bg-padel-primary hover:text-black transition-all shadow-lg"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    href={`/players/${player.id}`}
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-gray-400 hover:bg-padel-primary hover:text-black transition-all shadow-lg"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <footer className="mt-16 pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] font-black tracking-[0.3em] uppercase text-gray-700 italic">PADEL SMART Pro System • 2024</p>
                </footer>
            </div>

            <BottomNav />

            {/* Modal de Edición */}
            <AnimatePresence>
                {isEditModalOpen && editingPlayer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f0f0f] w-full max-w-lg rounded-[32px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-padel-primary/20 flex items-center justify-center">
                                        <Edit2 className="w-5 h-5 text-padel-primary" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Editar Perfil</h2>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Foto Section */}
                                <div className="flex justify-center">
                                    <div className="relative group">
                                        <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/5 overflow-hidden">
                                            {editingPlayer.photo ? (
                                                <img src={editingPlayer.photo} className="w-full h-full object-cover" />
                                            ) : (
                                                <Users className="w-10 h-10 text-gray-700 m-auto mt-6" />
                                            )}
                                        </div>
                                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-padel-primary rounded-full flex items-center justify-center text-black shadow-lg border-2 border-[#0f0f0f]">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.name}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Apellido</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.lastName}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, lastName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Cédula / DNI</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.dni || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, dni: formatDNI(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nivel (1-7)</label>
                                        <select
                                            value={editingPlayer.level || '4'}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, level: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7].map(l => <option key={l} value={l} className="bg-[#0f0f0f]">Nivel {l}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Posición</label>
                                        <select
                                            value={editingPlayer.position || 'Drive'}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {['Drive', 'Revés', 'Ambos'].map(p => <option key={p} value={p} className="bg-[#0f0f0f]">{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Instagram (@usuario)</label>
                                    <input
                                        type="text"
                                        placeholder="@pablomanuel"
                                        value={editingPlayer.instagram || ''}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, instagram: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Teléfono</label>
                                    <input
                                        type="text"
                                        value={editingPlayer.phone || ''}
                                        onChange={e => setEditingPlayer({ ...editingPlayer, phone: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/10 flex gap-4">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 py-4 rounded-2xl border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="flex-1 py-4 rounded-2xl bg-padel-primary text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PlayersListPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        }>
            <PlayersListContent />
        </Suspense>
    );
}
