'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES, type AdminSettings } from '@/lib/dataService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, UserCircle, Target, Plus, Edit2, Key,
    Eye, EyeOff, X, ShieldAlert, Settings, Users,
    Lock, Bell, Globe, Database, ChevronLeft, Layout,
    LogOut, Smartphone, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppSettings } from '@/lib/AppSettingsContext';

export default function AdminSettingsPage() {
    const { profile, isAdmin, loading: authLoading, logout } = useAuth();
    const { refresh: refreshAppSettings } = useAppSettings();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'general' | 'perfil'>('general');
    const [generalSettings, setGeneralSettings] = useState<Partial<AdminSettings>>({});
    const [generalLoading, setGeneralLoading] = useState(false);
    const [generalSaving, setGeneralSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

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
        if (isAdmin) loadGeneralSettings();
    }, [isAdmin]);

    const handleSaveGeneral = async () => {
        setGeneralSaving(true);
        try {
            await dataService.setAdminSettings({
                clubName: generalSettings.clubName ?? '',
                appTitle: generalSettings.appTitle ?? '',
                timezone: generalSettings.timezone ?? ''
            });
            await refreshAppSettings();
            alert('Configuración guardada correctamente.');
        } catch (e: any) {
            alert('Error al guardar: ' + (e?.message || e));
        } finally {
            setGeneralSaving(false);
        }
    };

    if (authLoading || (isAdmin && generalLoading && activeTab === 'general')) {
        return (
            <div className="h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAdmin) return null;

    const navItems = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'perfil', label: 'Mi Perfil', icon: UserCircle },
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit selection:bg-padel-primary selection:text-black">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-padel-primary/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[100px] rounded-full" />
            </div>

            {/* Sidebar (Sync with Admin Hub) */}
            <aside className="fixed left-0 top-0 bottom-0 w-24 hidden lg:flex flex-col items-center py-10 bg-black/40 backdrop-blur-3xl border-r border-white/5 z-50">
                <Link href="/admin" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-12 hover:bg-padel-primary hover:text-black transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </Link>
                <nav className="flex-1 flex flex-col gap-8">
                    <button onClick={() => router.push('/admin/users')} className="p-4 rounded-2xl text-gray-600 hover:text-white transition-colors"><Users className="w-6 h-6" /></button>
                    <button className="p-4 rounded-2xl bg-padel-primary/10 text-padel-primary border border-padel-primary/20"><Settings className="w-6 h-6" /></button>
                </nav>
                <button onClick={logout} className="p-4 rounded-2xl text-gray-700 hover:text-red-500 transition-colors">
                    <LogOut className="w-6 h-6" />
                </button>
            </aside>

            <main className="lg:pl-24 relative z-10 max-w-5xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin" className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-padel-primary italic">Configuraciones</h4>
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Ajustes del <span className="text-padel-primary">Sistema</span></h2>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Navigation Tabs */}
                    <div className="lg:col-span-1 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase italic text-[10px] tracking-widest transition-all ${activeTab === item.id
                                        ? 'bg-padel-primary text-black shadow-[0_10px_20px_rgba(204,255,0,0.2)]'
                                        : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10"
                                >
                                    <h3 className="text-xl font-black uppercase italic mb-8 flex items-center gap-3">
                                        <Globe className="text-padel-primary w-5 h-5" /> Información del Club
                                    </h3>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Nombre del Club / Sede</label>
                                            <input
                                                type="text"
                                                value={generalSettings.clubName || ''}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, clubName: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/30 transition-all font-bold text-sm uppercase italic"
                                                placeholder="EJ. PADEL CLUB CARACAS"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Título de la App (Navegador)</label>
                                            <input
                                                type="text"
                                                value={generalSettings.appTitle || ''}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, appTitle: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/30 transition-all font-bold text-sm uppercase italic"
                                                placeholder="EJ. PADEL SMART"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Zona Horaria</label>
                                            <select
                                                value={generalSettings.timezone || 'America/Caracas'}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 outline-none focus:border-padel-primary/30 transition-all font-bold text-sm uppercase italic appearance-none"
                                            >
                                                <option value="America/Caracas">Caracas (GMT-4)</option>
                                                <option value="America/Argentina/Buenos_Aires">Buenos Aires (GMT-3)</option>
                                                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                                                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleSaveGeneral}
                                            disabled={generalSaving}
                                            className="w-full bg-padel-primary text-black font-black uppercase italic py-4 rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 mt-8"
                                        >
                                            {generalSaving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'perfil' && (
                                <motion.div
                                    key="perfil"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10"
                                >
                                    <div className="flex flex-col items-center mb-10">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-padel-primary/20 to-black border border-padel-primary/30 flex items-center justify-center font-black text-3xl text-padel-primary mb-4">
                                            {profile?.name?.[0] || 'A'}
                                        </div>
                                        <h3 className="text-xl font-black uppercase italic">{profile?.name || 'Administrador'}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-padel-primary/60">Super Usuario</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 p-6 bg-black/20 border border-white/5 rounded-2xl">
                                            <Mail className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Email Registrado</p>
                                                <p className="text-sm font-bold">{profile?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-6 bg-black/20 border border-white/5 rounded-2xl">
                                            <ShieldCheck className="w-5 h-5 text-gray-600" />
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Nivel de Acceso</p>
                                                <p className="text-sm font-bold uppercase italic text-padel-primary">{profile?.role || 'ADMIN'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="w-full mt-10 border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-500 py-4 rounded-2xl font-black uppercase italic text-xs transition-all"
                                    >
                                        Desconectar Dispositivo
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
