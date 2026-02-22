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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((u, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={u.uid}
                            className={`glass p-6 relative overflow-hidden transition-all border-white/5 ${updating === u.uid ? 'opacity-50 grayscale' : ''}`}
                        >
                            {/* Role Background Icon */}
                            <div className="absolute -top-4 -right-4 opacity-[0.03]">
                                {u.role === ROLES.ADMIN ? <ShieldCheck className="w-24 h-24" /> :
                                    u.role === ROLES.MARKER ? <Target className="w-24 h-24" /> :
                                        <UserCircle className="w-24 h-24" />}
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                    <User className="w-6 h-6 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-lg truncate uppercase italic tracking-tight leading-none mb-1">
                                        {u.name || 'Sin Nombre'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold">
                                        <Mail className="w-3 h-3" />
                                        <span className="truncate">{u.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Seleccionar Rol</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: ROLES.ADMIN, label: 'ADMIN', color: 'bg-padel-primary', icon: ShieldCheck },
                                        { id: ROLES.MARKER, label: 'MARCADOR', color: 'bg-blue-500', icon: Target },
                                        { id: ROLES.PLAYER, label: 'JUGADOR', color: 'bg-gray-500', icon: UserCircle }
                                    ].map((role) => (
                                        <button
                                            key={role.id}
                                            disabled={updating === u.uid}
                                            onClick={() => handleRoleChange(u.uid, role.id)}
                                            className={`relative h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all border ${u.role === role.id
                                                    ? `${role.color} text-black border-transparent scale-[1.05] z-10 shadow-lg`
                                                    : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'
                                                }`}
                                        >
                                            <role.icon className="w-5 h-5" />
                                            <span className="text-[8px] font-black tracking-tighter capitalize">{role.label}</span>
                                            {u.role === role.id && (
                                                <div className="absolute -top-1 -right-1">
                                                    <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                                        <div className="w-1.5 h-1.5 bg-black rounded-full" />
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-bold text-gray-600">
                                <span className="uppercase tracking-widest">ID: {u.uid.substring(0, 8)}...</span>
                                <span className="italic uppercase">Ult. Acceso: {u.updatedAt ? new Date(u.updatedAt.toDate()).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
