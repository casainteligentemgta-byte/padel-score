'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES } from '@/lib/dataService';
import { Shield, User, Mail, RefreshCw, ChevronRight, Save, ShieldCheck, UserCircle, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
    const { user, profile, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !isAdmin) {
                // Si no es admin, redirigir al inicio
                router.push('/');
                return;
            }
            loadUsers();
        }
    }, [user, isAdmin, authLoading]);

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

    const handleRoleChange = async (uid: string, newRole: string) => {
        setUpdating(uid);
        try {
            await dataService.setUserProfile(uid, { role: newRole });
            setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error(err);
            alert('Error al actualizar el rol');
        } finally {
            setUpdating(null);
        }
    };

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

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 flex-shrink-0 pl-16 md:pl-0">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                        Gestión de <span className="text-padel-primary">Accesos</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Asigna roles y permisos a los usuarios de la plataforma.</p>
                </div>
                <div className="bg-padel-primary/10 border border-padel-primary/20 p-4 rounded-2xl flex items-center gap-4">
                    <ShieldCheck className="w-8 h-8 text-padel-primary" />
                    <div>
                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Nivel de Acceso</p>
                        <p className="text-sm font-bold text-padel-primary uppercase italic">Administrador Maestro</p>
                    </div>
                </div>
            </header>

            <div className="ipad-scroll-area pb-40">
                <div className="glass overflow-hidden border-white/5">
                    {/* Table Header */}
                    <div className="hidden md:grid grid-cols-[1fr,2fr,2fr,1fr] gap-4 p-6 bg-white/[0.02] border-b border-white/10 text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] italic">
                        <div className="pl-4">Usuario</div>
                        <div>Email / ID</div>
                        <div className="text-center">Asignar Rol</div>
                        <div className="text-right pr-4">Estado</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {users.map((u, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                key={u.uid}
                                className={`group relative p-4 md:p-6 hover:bg-white/[0.02] transition-all ${updating === u.uid ? 'opacity-50 grayscale cursor-wait' : ''}`}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-[1fr,2fr,2fr,1fr] items-center gap-6">
                                    {/* User Info */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 group-hover:border-padel-primary/50 transition-colors">
                                                {u.photo ? (
                                                    <img src={u.photo} className="w-full h-full object-cover rounded-2xl" alt="" />
                                                ) : (
                                                    <UserCircle className="w-7 h-7 text-gray-600 group-hover:text-padel-primary transition-colors" />
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black flex items-center justify-center ${u.role === ROLES.ADMIN ? 'bg-padel-primary' :
                                                    u.role === ROLES.MARKER ? 'bg-blue-500' : 'bg-gray-500'
                                                }`}>
                                                {u.role === ROLES.ADMIN ? <Shield className="w-2 h-2 text-black" /> :
                                                    u.role === ROLES.MARKER ? <Target className="w-2 h-2 text-white" /> :
                                                        <User className="w-2 h-2 text-white" />}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-sm text-white uppercase italic tracking-tight truncate">
                                                {u.name || 'Sin Identificar'}
                                            </h3>
                                            <span className="text-[10px] font-black text-padel-primary/40 uppercase tracking-tighter">@{u.uid.substring(0, 6)}</span>
                                        </div>
                                    </div>

                                    {/* Email / Meta */}
                                    <div className="hidden md:block">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <Mail className="w-3.5 h-3.5 opacity-40" />
                                            <span className="text-xs font-medium truncate">{u.email}</span>
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-widest pl-5">
                                            Registro: {u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'Desconocido'}
                                        </div>
                                    </div>

                                    {/* Role Selector Box */}
                                    <div className="flex justify-center flex-shrink-0">
                                        <div className="inline-flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm self-center">
                                            {[
                                                { id: ROLES.ADMIN, icon: Shield, label: 'Admin', color: 'hover:bg-padel-primary/20 hover:text-padel-primary', active: 'bg-padel-primary text-black' },
                                                { id: ROLES.MARKER, icon: Target, label: 'Marker', color: 'hover:bg-blue-500/20 hover:text-blue-500', active: 'bg-blue-500 text-white' },
                                                { id: ROLES.PLAYER, icon: UserCircle, label: 'Player', color: 'hover:bg-white/10 hover:text-white', active: 'bg-white/20 text-white' }
                                            ].map((role) => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => handleRoleChange(u.uid, role.id)}
                                                    disabled={updating === u.uid}
                                                    className={`px-4 py-2 rounded-[14px] flex items-center gap-2 transition-all duration-300 ${u.role === role.id
                                                            ? `${role.active} shadow-[0_0_20px_rgba(204,255,0,0.1)]`
                                                            : `text-gray-500 ${role.color}`
                                                        }`}
                                                >
                                                    <role.icon className={`w-3.5 h-3.5 ${u.role === role.id ? 'animate-pulse' : ''}`} />
                                                    <span className="text-[10px] font-black uppercase italic tracking-tighter hidden sm:block">
                                                        {role.label}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Status Status */}
                                    <div className="flex justify-end pr-4 text-right">
                                        <div className="hidden lg:block">
                                            <p className="text-[9px] font-black uppercase text-gray-600 tracking-widest mb-1">Actividad</p>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span className="w-1.5 h-1.5 rounded-full bg-padel-primary animate-pulse" />
                                                <span className="text-[10px] font-bold text-white uppercase italic">Online</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-800 ml-4 hidden md:block" />
                                    </div>
                                </div>

                                {/* Mobile Metadata Overlay */}
                                <div className="md:hidden mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-black text-gray-600 uppercase tracking-widest">
                                    <span>{u.email}</span>
                                    <span>ID: {u.uid.substring(0, 8)}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
