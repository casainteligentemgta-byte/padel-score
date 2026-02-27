'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES, type AdminSettings } from '@/lib/dataService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, UserCircle, Target, Plus, Edit2, Key,
    Eye, EyeOff, X, ShieldAlert, Settings, Users,
    Lock, Bell, Globe, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CANCHA_IDS, getCanchaLabel } from '@/lib/markerCanchas';
import { useAppSettings } from '@/lib/AppSettingsContext';

export default function AdminSettingsPage() {
    const { profile, isAdmin, loading: authLoading } = useAuth();
    const { refresh: refreshAppSettings } = useAppSettings();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'users' | 'general' | 'perfil'>('users');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [cleaningPasswords, setCleaningPasswords] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: ROLES.PLAYER
    });

    const [generalSettings, setGeneralSettings] = useState<Partial<AdminSettings>>({});
    const [generalLoading, setGeneralLoading] = useState(false);
    const [generalSaving, setGeneralSaving] = useState(false);

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

    const loadGeneralSettings = async () => {
        setGeneralLoading(true);
        try {
            const data = await dataService.getAdminSettings();
            setGeneralSettings(data || {});
        } catch (err) {
            console.error(err);
        } finally {
            setGeneralLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin && activeTab === 'general') loadGeneralSettings();
    }, [isAdmin, activeTab]);

    const handleSaveGeneral = async () => {
        setGeneralSaving(true);
        try {
            await dataService.setAdminSettings({
                clubName: generalSettings.clubName ?? '',
                appTitle: generalSettings.appTitle ?? '',
                timezone: generalSettings.timezone ?? ''
            });
            await refreshAppSettings();
            alert('Configuración guardada.');
        } catch (e: any) {
            alert('Error: ' + (e?.message || e));
        } finally {
            setGeneralSaving(false);
        }
    };

    const handleRoleChange = async (uid: string, newRole: string) => {
        setUpdating(uid);
        try {
            const update: any = { role: newRole };
            if (newRole !== ROLES.MARKER) update.markerCanchas = [];
            await dataService.setUserProfile(uid, update);
            setUsers(users.map(u => u.uid === uid ? { ...u, ...update } : u));
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const handleSetMarkerCanchas = async (uid: string, canchas: string[]) => {
        setUpdating(uid);
        try {
            await dataService.setUserProfile(uid, { markerCanchas: canchas });
            setUsers(users.map(u => u.uid === uid ? { ...u, markerCanchas: canchas } : u));
        } catch (err) {
            console.error(err);
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

    const handleCleanupPasswords = async () => {
        if (!confirm('¿Eliminar el campo contraseña de todos los perfiles en la base de datos? (Recomendado por seguridad, una sola vez).')) return;
        setCleaningPasswords(true);
        try {
            const count = await dataService.removePasswordsFromAllUsers();
            alert(`Listo. Se eliminó el campo contraseña de ${count} perfil(es).`);
            await loadUsers();
        } catch (e: any) {
            alert('Error: ' + (e?.message || e));
        } finally {
            setCleaningPasswords(false);
        }
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
                    role: formData.role
                });
            } else {
                // Para crear un usuario nuevo con Auth, se requeriría una función de Cloud Functions
                // o usar una API secundaria. Por ahora lo guardamos en el perfil.
                const newUid = `user_${Date.now()}`;
                await dataService.setUserProfile(newUid, {
                    uid: newUid,
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
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
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
                            <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Control de roles y permisos del sistema.</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCleanupPasswords}
                                    disabled={cleaningPasswords}
                                    className="bg-white/5 border border-white/10 text-gray-400 px-4 py-2.5 rounded-xl font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {cleaningPasswords ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    {cleaningPasswords ? 'Limpiando…' : 'Limpiar contraseñas guardadas'}
                                </button>
                                <button
                                    onClick={handleAddClick}
                                    className="bg-padel-primary/10 border border-padel-primary/30 text-padel-primary px-6 py-2.5 rounded-xl font-black text-[10px] tracking-widest uppercase flex items-center gap-2 hover:bg-padel-primary hover:text-black transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Nuevo Acceso
                                </button>
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
                            <div className="grid grid-cols-12 px-8 py-5 bg-white/[0.03] border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">
                                <div className="col-span-3">Usuario</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-1">Seg.</div>
                                <div className="col-span-2 text-center">Rol</div>
                                <div className="col-span-2 text-center">Canchas</div>
                                <div className="col-span-1 text-right">Edit</div>
                            </div>
                            <div className="divide-y divide-white/5">
                                {users.map((u) => (
                                    <div key={u.uid} className="grid grid-cols-12 items-center px-8 py-5 hover:bg-white/[0.01] transition-colors group">
                                        <div className="col-span-3 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-padel-primary/10 flex items-center justify-center text-padel-primary border border-padel-primary/10">
                                                {u.role === ROLES.ADMIN ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-bold uppercase italic tracking-tight text-sm">{u.name || 'Sin nombre'}</p>
                                                <p className="text-[9px] text-gray-600 font-bold tracking-widest">ID: {u.uid.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                        <div className="col-span-3 text-gray-400 text-xs font-medium lowercase truncate">
                                            {u.email}
                                        </div>
                                        <div className="col-span-1 text-[10px] text-gray-600">Auth</div>
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
                                        <div className="col-span-2 flex justify-center gap-1 flex-wrap">
                                            {u.role === ROLES.MARKER ? (
                                                CANCHA_IDS.map((cId) => {
                                                    const active = (u.markerCanchas || []).includes(cId);
                                                    return (
                                                        <button
                                                            key={cId}
                                                            type="button"
                                                            onClick={() => toggleCanchaForUser(u.uid, cId)}
                                                            disabled={updating === u.uid}
                                                            title={getCanchaLabel(cId)}
                                                            className={`w-7 h-7 rounded text-[9px] font-black ${active ? 'bg-padel-primary/30 text-padel-primary border border-padel-primary/50' : 'bg-white/5 text-gray-600 border border-white/10'}`}
                                                        >
                                                            {cId.replace('cancha_', '')}
                                                        </button>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-gray-600">—</span>
                                            )}
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
                        className="space-y-6"
                    >
                        <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Nombre del club, título de la app y zona horaria.</p>
                        {generalLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-10 h-10 text-padel-primary animate-spin" />
                            </div>
                        ) : (
                            <div className="glass rounded-[2rem] border border-white/5 overflow-hidden p-8 space-y-6">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Nombre del club</label>
                                    <input
                                        type="text"
                                        value={generalSettings.clubName ?? ''}
                                        onChange={e => setGeneralSettings(s => ({ ...s, clubName: e.target.value }))}
                                        placeholder="Ej. Club Pádel Norte"
                                        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-medium outline-none focus:border-padel-primary/50 transition-colors placeholder:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Título de la aplicación</label>
                                    <input
                                        type="text"
                                        value={generalSettings.appTitle ?? ''}
                                        onChange={e => setGeneralSettings(s => ({ ...s, appTitle: e.target.value }))}
                                        placeholder="Ej. Padel Score / Smart Padel"
                                        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-medium outline-none focus:border-padel-primary/50 transition-colors placeholder:text-gray-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block mb-2">Zona horaria</label>
                                    <select
                                        value={generalSettings.timezone ?? ''}
                                        onChange={e => setGeneralSettings(s => ({ ...s, timezone: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-medium outline-none focus:border-padel-primary/50 transition-colors"
                                    >
                                        <option value="">Sin especificar</option>
                                        <option value="Europe/Madrid">Europe/Madrid</option>
                                        <option value="Europe/Barcelona">Europe/Barcelona</option>
                                        <option value="America/Argentina/Buenos_Aires">America/Argentina/Buenos_Aires</option>
                                        <option value="America/Mexico_City">America/Mexico_City</option>
                                        <option value="America/Chile/Santiago">America/Santiago</option>
                                        <option value="UTC">UTC</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={handleSaveGeneral}
                                        disabled={generalSaving}
                                        className="bg-padel-primary text-black px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {generalSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Guardar configuración
                                    </button>
                                </div>
                            </div>
                        )}
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
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nota interna (no contraseña)</label>
                                        <input
                                            type="text"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-mono text-sm"
                                            placeholder="Ej: enviaste email de alta el 01/03"
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
