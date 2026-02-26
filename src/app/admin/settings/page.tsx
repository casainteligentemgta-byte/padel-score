'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES } from '@/lib/dataService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, UserCircle, Target, Plus, Edit2, Key,
    Eye, EyeOff, X, ShieldAlert, Settings, Users,
    Lock, Bell, Globe, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminSettingsPage() {
    const { profile, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'users' | 'general' | 'perfil'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: ROLES.PLAYER
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
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

    const handleRoleChange = async (uid: string, newRole: string) => {
        setUpdating(uid);
        try {
            await dataService.setUserProfile(uid, { role: newRole });
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const togglePasswordVisibility = (uid: string) => {
        setShowPasswords(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

    const handleEditClick = (user: any) => {
        setEditingUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: user.password || '',
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
        if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                await dataService.setUserProfile(editingUser.uid, {
                    name: formData.name,
                    role: formData.role,
                    password: formData.password
                });
            } else {
                // Para crear un usuario nuevo con Auth, se requeriría una función de Cloud Functions
                // o usar una API secundaria. Por ahora lo guardamos en el perfil.
                const newUid = `user_${Date.now()}`;
                await dataService.setUserProfile(newUid, {
                    ...formData,
                    uid: newUid,
                    createdAt: new Date().toISOString()
                });
            }
            await loadUsers();
            setIsModalOpen(false);
        } catch (err: any) {
            alert(err.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <RefreshCw className="w-10 h-10 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white p-8 overflow-y-auto no-scrollbar">
            {/* Header section similar to Publicidad */}
            <div className="relative mb-12">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-padel-primary/20 flex items-center justify-center border border-padel-primary/30">
                        <Settings className="w-6 h-6 text-padel-primary" />
                    </div>
                    <div>
                        <h4 className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic">Setting Center</h4>
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter">AJUSTES DEL <span className="text-padel-primary">SISTEMA</span></h1>
                    </div>
                </div>
            </div>

            {/* Tabs Selector */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'users' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'}`}
                >
                    <Users className="w-4 h-4" /> Gestión de Usuarios
                </button>
                <button
                    onClick={() => setActiveTab('general')}
                    className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'general' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'}`}
                >
                    <Globe className="w-4 h-4" /> General
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'users' ? (
                    <motion.div
                        key="users-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Control de roles y permisos del sistema.</p>
                            <button
                                onClick={handleAddClick}
                                className="bg-padel-primary/10 border border-padel-primary/30 text-padel-primary px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-padel-primary hover:text-black transition-all"
                            >
                                <Plus className="w-4 h-4" /> Nuevo Acceso
                            </button>
                        </div>

                        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-12 px-8 py-5 bg-white/[0.03] border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">
                                <div className="col-span-4">Usuario</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-2">Clave</div>
                                <div className="col-span-2 text-center">Rol</div>
                                <div className="col-span-1 text-right">Edit</div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {users.map((u) => (
                                    <div key={u.uid} className="grid grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.01] transition-colors group">
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-padel-primary/10 flex items-center justify-center text-padel-primary border border-padel-primary/10">
                                                {u.role === ROLES.ADMIN ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-bold uppercase italic tracking-tight text-sm">{u.name || 'Sin nombre'}</p>
                                                <p className="text-[9px] text-gray-600 font-bold tracking-widest">ID: {u.uid.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-gray-400 text-xs font-medium lowercase">
                                            {u.email}
                                        </div>
                                        <div className="col-span-2 flex items-center gap-3">
                                            <button onClick={() => togglePasswordVisibility(u.uid)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                                {showPasswords[u.uid] ? <EyeOff className="w-3.5 h-3.5 text-padel-primary" /> : <Eye className="w-3.5 h-3.5 text-gray-600" />}
                                            </button>
                                            <span className="font-mono text-[10px] tracking-widest text-gray-500 uppercase">
                                                {showPasswords[u.uid] ? (u.password || '******') : '••••••'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                                disabled={updating === u.uid}
                                                className={`bg-black border border-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${u.role === ROLES.ADMIN ? 'text-padel-primary border-padel-primary/30' : 'text-gray-500'}`}
                                            >
                                                <option value={ROLES.ADMIN}>ADMIN</option>
                                                <option value={ROLES.MARKER}>MARKER</option>
                                                <option value={ROLES.PLAYER}>PLAYER</option>
                                            </select>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <button onClick={() => handleEditClick(u)} className="p-2 text-gray-600 hover:text-padel-primary transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="general-tab"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="py-20 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6">
                            <Lock className="w-10 h-10 text-gray-800" />
                        </div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-600">Configuración General <span className="text-white/20">Próximamente</span></h3>
                        <p className="text-xs text-gray-700 font-bold uppercase tracking-widest mt-2">Módulo en desarrollo para control global del club.</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal de Usuario */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] overflow-hidden"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                                    {editingUser ? 'Editar' : 'Nuevo'} <span className="text-padel-primary">Usuario</span>
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-padel-primary/50 transition-all font-bold italic uppercase"
                                        placeholder="JUAN PEREZ"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            disabled={!!editingUser}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm"
                                            placeholder="email@ejemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Pass (Visual)</label>
                                        <input
                                            type="text"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Rol</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[ROLES.PLAYER, ROLES.MARKER, ROLES.ADMIN].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setFormData({ ...formData, role })}
                                                className={`py-4 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${formData.role === role ? 'bg-padel-primary/10 border-padel-primary text-padel-primary' : 'bg-white/5 border-transparent text-gray-700'}`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 border-t border-white/5 flex gap-4">
                                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-gray-600">Cancelar</button>
                                <button onClick={handleSaveUser} className="flex-1 bg-padel-primary text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingUser ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
