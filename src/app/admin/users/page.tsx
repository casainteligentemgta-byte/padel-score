'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES } from '@/lib/dataService';
import { rtdbService } from '@/lib/rtdbService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, UserCircle, Target, Plus, Edit2, Key,
    X, ShieldAlert, ChevronLeft, Search,
    Filter, Layout, LogOut, CheckCircle2, Users, Settings
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
            const data = await dataService.listAllUsersProfile();
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
        const matchesSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.uid || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
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

            {/* Sidebar (Consistent with Hub & Settings) */}
            <aside className="fixed left-0 top-0 bottom-0 w-24 hidden lg:flex flex-col items-center py-10 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-50">
                <Link href="/admin" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-12 hover:bg-padel-primary hover:text-black transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <nav className="flex-1 flex flex-col gap-8">
                    <button className="p-4 rounded-2xl bg-padel-primary/10 text-padel-primary border border-padel-primary/20"><Users className="w-6 h-6" /></button>
                    <button onClick={() => router.push('/admin/settings')} className="p-4 rounded-2xl text-gray-600 hover:text-white transition-colors"><Settings className="w-6 h-6" /></button>
                </nav>
                <button onClick={logout} className="p-4 rounded-2xl text-gray-700 hover:text-red-500 transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            {/* Main Content */}
            <main className="lg:pl-24 relative z-10 max-w-7xl mx-auto px-6 py-12">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/admin" className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-padel-primary italic">Administrative Core</h4>
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Control de <span className="text-padel-primary">Usuarios</span></h2>
                    </div>

                    <button
                        onClick={handleAddClick}
                        className="bg-padel-primary text-black px-8 py-4 rounded-2xl font-black uppercase italic text-xs shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5" /> Nuevo Registro
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

                    <div className="md:col-span-3 relative">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-700" />
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-14 pr-6 outline-none focus:border-padel-primary/30 transition-all font-black uppercase tracking-[0.2em] text-[10px] appearance-none cursor-pointer"
                        >
                            <option value="all">Ver Todos</option>
                            <option value={ROLES.ADMIN}>Administradores</option>
                            <option value={ROLES.MARKER}>Marcadores</option>
                            <option value={ROLES.PLAYER}>Jugadores</option>
                        </select>
                    </div>

                    <div className="md:col-span-3 flex items-center justify-center bg-padel-primary/5 border border-padel-primary/10 rounded-2xl px-6 py-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-padel-primary">
                            {filteredUsers.length} Registros activos
                        </span>
                    </div>
                </div>

                {/* Users List Grid */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="hidden lg:grid grid-cols-12 px-10 py-4 text-[9px] font-black uppercase tracking-[0.4em] text-gray-600 italic">
                        <div className="col-span-5">Identidad & Perfil</div>
                        <div className="col-span-3 text-center">Rol de Sistema</div>
                        <div className="col-span-3 text-center">Control de Canchas</div>
                        <div className="col-span-1 text-right">Acción</div>
                    </div>

                    <AnimatePresence>
                        {filteredUsers.map((u, idx) => (
                            <motion.div
                                key={u.uid}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-3xl border border-white/5 hover:border-padel-primary/20 rounded-[2rem] transition-all duration-300"
                            >
                                <div className="p-6 lg:px-10 lg:py-4 grid grid-cols-1 lg:grid-cols-12 items-center gap-6">
                                    {/* Identity */}
                                    <div className="lg:col-span-5 flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${u.role === ROLES.ADMIN ? 'bg-padel-primary/10 border-padel-primary/30 text-padel-primary' :
                                            u.role === ROLES.MARKER ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                                                'bg-white/5 border-white/10 text-gray-500'
                                            }`}>
                                            {u.role === ROLES.ADMIN ? <ShieldCheck size={28} /> :
                                                u.role === ROLES.MARKER ? <Target size={28} /> : <User size={28} />}
                                        </div>
                                        <div className="truncate">
                                            <h3 className="text-base font-black uppercase italic tracking-tighter leading-none mb-1 group-hover:text-padel-primary transition-colors">
                                                {u.name || 'Sin Nombre'}
                                            </h3>
                                            <p className="text-[9px] font-bold text-gray-500 lowercase flex items-center gap-2">
                                                <Mail size={12} /> {u.email || 'no-email@padel-smart.tk'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role Selector */}
                                    <div className="lg:col-span-3 flex justify-center">
                                        <div className="relative w-full max-w-[160px]">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                                disabled={updating === u.uid}
                                                className={`w-full bg-black/40 border-2 rounded-xl px-4 py-2.5 text-[9px] font-black uppercase tracking-widest outline-none transition-all cursor-pointer appearance-none ${u.role === ROLES.ADMIN ? 'border-padel-primary/30 text-padel-primary' :
                                                    u.role === ROLES.MARKER ? 'border-orange-500/30 text-orange-500' :
                                                        'border-white/10 text-gray-500'
                                                    }`}
                                            >
                                                <option value={ROLES.PLAYER}>Jugador</option>
                                                <option value={ROLES.MARKER}>Marcador</option>
                                                <option value={ROLES.ADMIN}>Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Permission Badges (Markers) */}
                                    <div className="lg:col-span-3 flex flex-wrap justify-center gap-2">
                                        {u.role === ROLES.MARKER ? (
                                            <div className="flex gap-1.5 p-1.5 bg-black/40 rounded-xl border border-white/5">
                                                {CANCHA_IDS.map((cId) => (
                                                    <button
                                                        key={cId}
                                                        onClick={() => toggleCanchaForUser(u.uid, cId)}
                                                        className={`w-8 h-8 rounded-lg text-[9px] font-black transition-all ${(u.markerCanchas || []).includes(cId)
                                                            ? 'bg-padel-primary text-black'
                                                            : 'bg-white/5 text-gray-600 hover:text-white'
                                                            }`}
                                                    >
                                                        {cId.split('_')[1]}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-800 italic">— Global Access —</span>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="lg:col-span-1 flex justify-end gap-2">
                                        <button
                                            onClick={() => handleEditClick(u)}
                                            className="p-3 bg-white/5 text-gray-500 hover:text-padel-primary hover:bg-padel-primary/10 rounded-xl transition-all"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        {updating === u.uid && <RefreshCw size={16} className="animate-spin text-padel-primary mt-3" />}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </main>

            {/* User Edit Modal */}
            <AnimatePresence>
                {isModalOpen && (
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
                )}
            </AnimatePresence>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
                select { background-image: none !important; }
            `}</style>
        </div>
    );
}
