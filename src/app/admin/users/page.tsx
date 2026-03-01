'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES } from '@/lib/dataService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, UserCircle, Target, Plus, Edit2, Key,
    Eye, EyeOff, X, ShieldAlert, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged } from 'firebase/auth';
import { firebaseConfig } from '@/lib/firebase';
import { CANCHA_IDS, getCanchaLabel } from '@/lib/markerCanchas';

export default function AdminUsersPage() {
    const { profile, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
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
            const update: any = { role: newRole };
            if (newRole !== ROLES.MARKER) update.markerCanchas = [];
            await dataService.setUserProfile(uid, update);
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
        if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            if (editingUser) {
                // Actualizar usuario existente en Firestore
                const updateData: any = {
                    name: formData.name,
                    role: formData.role
                };

                await dataService.setUserProfile(editingUser.uid, updateData);
                setUsers(users.map(u => u.uid === editingUser.uid ? { ...u, ...updateData } : u));
                setIsModalOpen(false);
            } else {
                // Crear nuevo usuario en Firebase Auth usando una instancia secundaria
                // para evitar cerrar la sesión del admin actual
                const secAppName = `SecondaryApp-${Date.now()}`;
                const secApp = initializeApp(firebaseConfig, secAppName);
                const secAuth = getAuth(secApp);

                try {
                    const userCredential = await createUserWithEmailAndPassword(secAuth, formData.email, formData.password);
                    const newUser = userCredential.user;

                    // Actualizar el perfil en Auth (opcional)
                    await updateProfile(newUser, { displayName: formData.name });

                    // Guardar en Firestore (marcadores autorizados por defecto)
                    const userProfile = {
                        uid: newUser.uid,
                        name: formData.name,
                        email: formData.email,
                        role: formData.role,
                        markerCanchas: formData.role === ROLES.MARKER ? [] : undefined,
                        createdAt: new Date().toISOString()
                    };

                    await dataService.setUserProfile(newUser.uid, userProfile);
                    setUsers([...users, userProfile]);

                    // Cerrar sesión en la instancia secundaria y borrar la app
                    await signOut(secAuth);
                    setIsModalOpen(false);
                } catch (authErr: any) {
                    throw new Error(`Error Auth: ${authErr.message}`);
                } finally {
                    await deleteApp(secApp).catch(console.error);
                }
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Error al guardar el usuario');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-10 h-10 text-padel-primary animate-spin" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Cargando Accesos...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white p-8">
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
            >
                <ChevronLeft className="w-5 h-5" />
                Atrás
            </Link>
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        Gestión de <span className="text-padel-primary">Accesos</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Control de roles y permisos del sistema.</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="bg-padel-primary text-black px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> NUEVO USUARIO
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* Table Header */}
                <div className="grid grid-cols-12 px-6 py-4 bg-white/5 rounded-t-2xl border-x border-t border-white/10 text-[10px] font-black uppercase text-gray-500 tracking-widest italic">
                    <div className="col-span-4">Usuario</div>
                    <div className="col-span-3">Email</div>
                    <div className="col-span-1">Seguridad</div>
                    <div className="col-span-2 text-center">Rol</div>
                    <div className="col-span-2 text-center">Autorizado</div>
                    <div className="col-span-1 text-right">Acciones</div>
                </div>

                <div className="bg-black border border-white/10 rounded-b-2xl overflow-hidden divide-y divide-white/5">
                    {users.map((u) => (
                        <div key={u.uid} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-white/[0.02] transition-colors group">
                            {/* User Info */}
                            <div className="col-span-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-padel-primary/10 flex items-center justify-center text-padel-primary border border-padel-primary/20 p-0.5">
                                    {u.role === ROLES.ADMIN ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className="truncate">
                                    <p className="font-bold uppercase italic tracking-tight">{u.name || 'Sin nombre'}</p>
                                    <p className="text-[10px] text-gray-500 font-medium">UID: {u.uid.slice(0, 8)}...</p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="col-span-3 flex items-center gap-2 text-gray-400 text-sm">
                                <Mail className="w-4 h-4 opacity-50" />
                                <span className="truncate">{u.email}</span>
                            </div>

                            <div className="col-span-1 text-xs text-gray-500">Auth</div>

                            {/* Role Select */}
                            <div className="col-span-2 flex justify-center">
                                <select
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.uid, e.target.value)}
                                    disabled={updating === u.uid}
                                    className={`appearance-none bg-black border-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all ${u.role === ROLES.ADMIN ? 'border-padel-primary/30 text-padel-primary' :
                                            u.role === ROLES.MARKER ? 'border-orange-500/30 text-orange-500' :
                                                'border-gray-500/30 text-gray-500'
                                        }`}
                                >
                                    <option value={ROLES.ADMIN}>ADMIN</option>
                                    <option value={ROLES.MARKER}>MARKER</option>
                                    <option value={ROLES.PLAYER}>PLAYER</option>
                                </select>
                            </div>

                            {/* Canchas asignadas (solo marcadores): solo puede marcar en estas pistas */}
                            <div className="col-span-2 flex justify-center items-center gap-1 flex-wrap">
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
                                                className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${active ? 'bg-padel-primary/30 text-padel-primary border border-padel-primary/50' : 'bg-white/5 text-gray-600 border border-white/10 hover:border-white/20'}`}
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
                                <button
                                    onClick={() => handleEditClick(u)}
                                    className="p-2 text-gray-500 hover:text-padel-primary hover:bg-padel-primary/10 rounded-xl transition-all"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-padel-primary/10 to-transparent">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-padel-primary/20 flex items-center justify-center text-padel-primary">
                                        {editingUser ? <Edit2 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black italic uppercase tracking-tighter">
                                            {editingUser ? 'Editar' : 'Nuevo'} <span className="text-padel-primary">Usuario</span>
                                        </h2>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            {editingUser ? `UID: ${editingUser.uid}` : 'Crea una nueva cuenta de acceso'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 text-gray-500 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block ml-1 italic">Nombre Completo</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-padel-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Ej: Juan Pérez"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-padel-primary/50 transition-all font-bold italic uppercase tracking-tight"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block ml-1 italic">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-padel-primary transition-colors" />
                                            <input
                                                type="email"
                                                value={formData.email}
                                                disabled={!!editingUser}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="email@ejemplo.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-padel-primary/50 disabled:opacity-50 transition-all font-bold tracking-tight lowercase"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block ml-1 italic">Contraseña</label>
                                        <div className="relative group">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-padel-primary transition-colors" />
                                            <input
                                                type="text"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                placeholder="••••••••"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-padel-primary/50 transition-all font-bold tracking-tight"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block ml-1 italic">Rol Asignado</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[ROLES.PLAYER, ROLES.MARKER, ROLES.ADMIN].map((role) => (
                                            <button
                                                key={role}
                                                onClick={() => setFormData({ ...formData, role })}
                                                className={`py-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === role ? 'bg-padel-primary/10 border-padel-primary' : 'bg-white/5 border-white/5 opacity-50'
                                                    }`}
                                            >
                                                {role === ROLES.ADMIN ? <ShieldCheck className="w-6 h-6" /> :
                                                    role === ROLES.MARKER ? <Target className="w-6 h-6" /> : <UserCircle className="w-6 h-6" />}
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{role}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {editingUser && (
                                    <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex gap-3 text-orange-500">
                                        <ShieldAlert className="w-5 h-5 shrink-0" />
                                        <p className="text-[10px] font-bold uppercase leading-relaxed italic">
                                            Importante: El cambio de clave es referencial para visualización del Admin.
                                            Para cambiar la clave de login real, use el flujo de recuperación de Auth.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-gray-500 hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveUser}
                                    disabled={loading}
                                    className="flex-1 bg-padel-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(204,255,0,0.2)]"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
