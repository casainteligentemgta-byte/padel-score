'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES } from '@/lib/dataService';
import { rtdbService } from '@/lib/rtdbService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, UserCircle, Target, Plus, Edit2, Key,
    X, ShieldAlert, ChevronLeft, Search,
    Filter, Layout, LogOut, CheckCircle2, Users, Settings, Phone
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CANCHA_IDS, getCanchaLabel } from '@/lib/markerCanchas';

export default function AdminUsersPage() {
    const { profile, isAdmin, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<string>('all');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: ROLES.PLAYER
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.replace('/');
        }
    }, [isAdmin, authLoading, router]);

    const loadUsers = async () => {
        try {
            const data = await dataService.getAllParticipants();
            setUsers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) loadUsers();
    }, [isAdmin]);

    const handleRoleChange = async (uid: string, newRole: any) => {
        setUpdating(uid);
        try {
            const update: any = { role: newRole };
            if (newRole !== ROLES.MARKER) update.markerCanchas = [];

            await dataService.setUserProfile(uid, update);

            const user = users.find(u => u.uid === uid);
            if (user) {
                await rtdbService.setRTDBUserRole(
                    uid,
                    newRole.toLowerCase() as any,
                    user.name || 'Sin nombre',
                    user.email || 'no-email@padel-smart.tk',
                    (update.markerCanchas && update.markerCanchas.length > 0) ? update.markerCanchas[0] : undefined
                );
            }

            setUsers(users.map(u => u.uid === uid ? { ...u, ...update } : u));
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el rol');
        } finally {
            setUpdating(null);
        }
    };

    const handleSetMarkerCanchas = async (uid: string, canchas: string[]) => {
        setUpdating(uid);
        try {
            await dataService.setUserProfile(uid, { markerCanchas: canchas });

            const user = users.find(u => u.uid === uid);
            if (user) {
                await rtdbService.setRTDBUserRole(
                    uid,
                    (user.role || ROLES.PLAYER).toLowerCase() as any,
                    user.name || 'Sin nombre',
                    user.email || 'no-email@padel-smart.tk',
                    canchas.length > 0 ? canchas[0] : undefined
                );
            }

            setUsers(users.map(u => u.uid === uid ? { ...u, markerCanchas: canchas } : u));
        } catch (err) {
            console.error(err);
            alert('Error al actualizar canchas');
        } finally {
            setUpdating(null);
        }
    };

    const toggleCanchaForUser = (uid: string, canchaId: string) => {
        const u = users.find(x => x.uid === uid);
        const current: string[] = Array.isArray(u?.markerCanchas) ? u.markerCanchas : [];
        const next = current.includes(canchaId) ? current.filter(c => c !== canchaId) : [...current, canchaId];
        handleSetMarkerCanchas(uid, next);
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || ROLES.PLAYER
        });
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: ROLES.PLAYER
        });
        setIsModalOpen(true);
    };

    const handleSaveUser = async () => {
        if (!formData.name || (!editingUser && !formData.email)) {
            alert('Por favor completa los campos principales (Nombre y Email)');
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                const updateData: any = {
                    name: formData.name,
                    role: formData.role
                };

                await dataService.setUserProfile(editingUser.uid, updateData);

                await rtdbService.setRTDBUserRole(
                    editingUser.uid,
                    formData.role.toLowerCase() as any,
                    formData.name,
                    formData.email || editingUser.email || 'no-email@padel-smart.tk',
                    (editingUser.markerCanchas && editingUser.markerCanchas.length > 0) ? editingUser.markerCanchas[0] : undefined
                );

                setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, ...updateData, email: formData.email || u.email } : u));
                setIsModalOpen(false);
            } else {
                alert('Aviso Profesional: Para crear usuarios con acceso total, use el Dashboard de Supabase. Registraremos el perfil localmente.');
                setIsModalOpen(false);
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => {
        const search = searchTerm.toLowerCase();
        return (u.name || '').toLowerCase().includes(search) ||
            (u.lastName || '').toLowerCase().includes(search) ||
            (u.fullName || '').toLowerCase().includes(search) ||
            (u.email || '').toLowerCase().includes(search) ||
            (u.phone || '').toLowerCase().includes(search);
    });

    if (authLoading || loading) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit selection:bg-padel-primary selection:text-black">
            {/* Ambient Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-padel-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/admin" className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-xl transition-colors border border-white/5 bg-black/20 group">
                                <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-padel-primary transition-colors" />
                            </Link>
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                            <div className="w-12 h-12 bg-padel-primary/10 rounded-2xl flex items-center justify-center border border-padel-primary/20">
                                <Users className="w-7 h-7 text-padel-primary" />
                            </div>
                            <span>Control de <span className="text-padel-primary">Jugadores</span></span>
                        </h2>
                    </div>

                    <button
                        onClick={() => router.push('/players/register')}
                        className="bg-padel-primary text-black px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Jugador
                    </button>
                </header>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
                    <div className="md:col-span-6 relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-padel-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="BUSCAR POR NOMBRE, EMAIL O ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-padel-primary/30 transition-all font-bold text-xs uppercase tracking-widest placeholder:text-gray-700"
                        />
                    </div>

                    <div className="md:col-span-6 flex items-center justify-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-padel-primary/60 italic">
                            {filteredUsers.length} JUGADORES ACTIVOS EN SISTEMA
                        </span>
                    </div>
                </div>

                {/* Users List Grid - Updated Table Header */}
                <div className="grid grid-cols-1 gap-2">
                    <div className="hidden lg:grid grid-cols-12 px-10 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
                        <div className="col-span-1">FOTO</div>
                        <div className="col-span-3">NOMBRES</div>
                        <div className="col-span-3">APELLIDOS</div>
                        <div className="col-span-2">WHATSAPP</div>
                        <div className="col-span-2 text-center">NIVEL</div>
                        <div className="col-span-1 text-right">MODIFICAR</div>
                    </div>

                    <AnimatePresence>
                        {filteredUsers.map((u, idx) => (
                            <motion.div
                                key={u.id || u.uid}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl border border-white/5 hover:border-padel-primary/20 rounded-2xl transition-all duration-300"
                            >
                                <div className="px-10 py-3 grid grid-cols-1 lg:grid-cols-12 items-center gap-2">
                                    {/* Photo */}
                                    <div className="lg:col-span-1">
                                        <Link
                                            href={u.id ? `/players/${u.id}` : '#'}
                                            className="block w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-padel-primary/50 transition-all hover:scale-105 active:scale-95"
                                        >
                                            {u.photo ? (
                                                <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-700">
                                                    <User size={20} />
                                                </div>
                                            )}
                                        </Link>
                                    </div>

                                    {/* Names */}
                                    <div className="lg:col-span-3">
                                        <h3 className="text-[11px] font-black uppercase italic tracking-tighter text-white group-hover:text-padel-primary transition-colors truncate">
                                            {u.name || (u.fullName?.split(' ')[0]) || 'S/N'}
                                        </h3>
                                    </div>

                                    {/* Surnames */}
                                    <div className="lg:col-span-3">
                                        <h3 className="text-[11px] font-black uppercase italic tracking-tighter text-gray-400 truncate">
                                            {u.lastName || (u.fullName?.split(' ').slice(1).join(' ')) || '—'}
                                        </h3>
                                    </div>

                                    {/* WhatsApp */}
                                    <div className="lg:col-span-2">
                                        <a
                                            href={u.phone ? `https://wa.me/${u.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${(u.name || u.fullName || '').split(' ')[0]}, te escribimos de Smart Padel! 🎾🚀`)}` : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-gray-500 hover:text-green-500 uppercase flex items-center gap-1.5 transition-colors group/wa"
                                        >
                                            <Phone size={10} className="text-padel-primary/40 group-hover/wa:text-green-500 transition-colors" />
                                            {u.phone || u.whatsapp || '—'}
                                        </a>
                                    </div>

                                    {/* Nivel */}
                                    <div className="lg:col-span-2 flex justify-center">
                                        <div className="bg-padel-primary/10 border border-padel-primary/20 px-3 py-1 rounded-lg">
                                            <span className="text-[10px] font-black text-padel-primary italic">CAT. {u.level || '—'}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-1 flex justify-end">
                                        <Link
                                            href={u.id ? `/players/register?edit=${u.id}` : '#'}
                                            className="p-2.5 bg-white/5 text-gray-500 hover:text-padel-primary hover:bg-padel-primary/10 rounded-xl transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            {/* User Edit Modal */}
            <AnimatePresence>
                {
                    isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden relative z-10 p-10 shadow-3xl"
                            >
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                                            {editingUser ? 'Editar' : 'Registrar'} <span className="text-padel-primary">Perfil</span>
                                        </h2>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">ID: {editingUser?.uid || 'NEW_USER'}</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors"><X /></button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Nombre de Alarma</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/30 transition-all font-bold text-sm uppercase italic"
                                            placeholder="EJ. CARLOS ALCARAZ"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-4">Dirección Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled={!!editingUser}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/30 transition-all font-bold text-sm disabled:opacity-30"
                                            placeholder="usuario@padelsmart.app"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 pt-6">
                                        {[ROLES.PLAYER, ROLES.MARKER, ROLES.ADMIN].map((r) => (
                                            <button
                                                key={r}
                                                onClick={() => setFormData({ ...formData, role: r })}
                                                className={`py-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${formData.role === r
                                                    ? 'bg-padel-primary/10 border-padel-primary text-padel-primary shadow-xl shadow-padel-primary/5'
                                                    : 'bg-white/5 border-white/5 text-gray-600 grayscale opacity-40'
                                                    }`}
                                            >
                                                {r === ROLES.ADMIN ? <ShieldCheck size={24} /> : r === ROLES.MARKER ? <Target size={24} /> : <User size={24} />}
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{r}</span>
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleSaveUser}
                                        disabled={loading}
                                        className="w-full bg-padel-primary text-black font-black uppercase italic py-5 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl mt-10"
                                    >
                                        {loading ? <RefreshCw className="animate-spin" /> : <Save size={18} />}
                                        Finalizar Cambios
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                select { background-image: none !important; }
            `}</style>
        </div >
    );
}
