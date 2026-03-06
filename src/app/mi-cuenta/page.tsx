'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
    User,
    Mail,
    Shield,
    RefreshCw,
    Edit3,
    Save,
    X,
    Phone,
    Instagram,
    Shirt,
    Footprints,
    HeartPulse
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';
import LoginButton from '@/components/LoginButton';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function MiCuentaPage() {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [player, setPlayer] = useState<any | null>(null);
    const [loadingPlayer, setLoadingPlayer] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [user, authLoading, router]);

    // Cargar ficha de jugador asociada a este usuario (participants.ownerId = uid)
    useEffect(() => {
        const load = async () => {
            if (!user?.uid) {
                setPlayer(null);
                setLoadingPlayer(false);
                return;
            }
            try {
                const mine = await dataService.getMyParticipants(user.uid);
                setPlayer(mine[0] || null);
            } catch {
                setPlayer(null);
            } finally {
                setLoadingPlayer(false);
            }
        };
        if (!authLoading && user) load();
    }, [authLoading, user]);

    const roleLabel = profile?.role === 'admin' ? 'Administrador' : profile?.role === 'marker' ? 'Marcador' : 'Jugador';

    const openEdit = () => {
        setEditName(profile?.name || user?.displayName || '');
        setError('');
        setEditOpen(true);
    };

    const saveProfile = async () => {
        const name = editName?.trim();
        if (!name) {
            setError('El nombre es obligatorio.');
            return;
        }
        if (!user?.uid) return;
        setSaving(true);
        setError('');
        try {
            await dataService.setUserProfile(user.uid, { name });
            const supabase = getSupabaseClient();
            if (supabase) await supabase.auth.updateUser({ data: { full_name: name, name } });
            await refreshProfile();
            setEditOpen(false);
        } catch (e: any) {
            setError(e?.message || 'Error al guardar. Intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
                <User className="w-20 h-20 text-padel-primary/20 mb-8" />
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Inicia Sesión</h1>
                <p className="text-gray-500 max-w-md mb-8">Inicia sesión para ver tus datos.</p>
                <LoginButton />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />
            <div className="flex items-center gap-3 mb-8 flex-shrink-0 pl-20 md:pl-24 pr-4 pt-6">
                <BouncingBall size={28} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Mis datos</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Datos de tu cuenta y ficha de jugador</p>
                </div>
            </div>
            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Tarjeta de cuenta (correo, rol) */}
                    <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-padel-primary/10 border border-padel-primary/20">
                                <div className="w-14 h-14 rounded-2xl bg-padel-primary/20 flex items-center justify-center flex-shrink-0">
                                    <User className="w-7 h-7 text-padel-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-black uppercase tracking-wider text-white truncate">{profile?.name || user.displayName || 'Usuario'}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Cuenta</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Email</p>
                                    <p className="text-sm font-bold text-white truncate">{user.email || profile?.email || '—'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 py-3 border-b border-white/5">
                                <Shield className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Rol</p>
                                    <p className="text-sm font-bold text-white">{roleLabel}</p>
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-600 pt-2">ID: {user.uid}</p>
                        </div>
                        <div className="px-6 md:px-8 pb-6">
                            <button
                                type="button"
                                onClick={openEdit}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-padel-primary text-black font-black text-xs uppercase tracking-widest hover:bg-padel-primary/90 transition-all active:scale-[0.98]"
                            >
                                <Edit3 className="w-4 h-4" />
                                Modificar y actualizar perfil
                            </button>
                        </div>
                    </div>

                    {/* Ficha de jugador (si existe en participants) */}
                    {!loadingPlayer && player && (
                        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden flex items-center justify-center flex-shrink-0 border border-white/10">
                                            {player.photo ? (
                                                <img src={player.photo} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-7 h-7 text-gray-600" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black uppercase tracking-wider text-white truncate">
                                                {player.name} {player.lastName}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                Ficha de jugador
                                            </p>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex flex-col items-end gap-1">
                                        <span className="px-2 py-1 rounded-full bg-padel-primary/10 text-padel-primary text-[10px] font-black uppercase tracking-widest">
                                            Nivel {player.level ?? 4}
                                        </span>
                                        <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                                            {player.position || 'Posición mixta'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                                    {/* Tallas */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                            <Shirt className="w-4 h-4" /> Tallas
                                        </p>
                                        <div className="text-xs text-gray-300 space-y-1">
                                            <p><span className="font-bold text-white">Franela:</span> {player.suitSize || '—'}</p>
                                            <p><span className="font-bold text-white">Short:</span> {player.shortSize || '—'}</p>
                                            <p className="flex items-center gap-1">
                                                <Footprints className="w-3 h-3 text-gray-500" />
                                                <span><span className="font-bold text-white">Calzado:</span> {player.shoeSize || '—'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Salud */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                            <HeartPulse className="w-4 h-4" /> Salud
                                        </p>
                                        <div className="text-xs text-gray-300 space-y-1">
                                            <p><span className="font-bold text-white">Tipo de sangre:</span> {player.bloodType || '—'}</p>
                                            <p><span className="font-bold text-white">Alergias:</span> {player.allergies || 'Ninguna reportada'}</p>
                                            <p><span className="font-bold text-white">Condiciones médicas:</span> {player.medicalConditions || 'Ninguna reportada'}</p>
                                        </div>
                                    </div>

                                    {/* Contacto */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                            <Phone className="w-4 h-4" /> Contacto
                                        </p>
                                        <div className="text-xs text-gray-300 space-y-1">
                                            <p><span className="font-bold text-white">Teléfono:</span> {player.phone || '—'}</p>
                                            <p className="flex items-center gap-1">
                                                <Instagram className="w-3 h-3 text-gray-500" />
                                                <span><span className="font-bold text-white">Instagram:</span> {player.instagram ? `@${String(player.instagram).replace('@', '')}` : 'No vinculado'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Identificación */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Identificación
                                        </p>
                                        <div className="text-xs text-gray-300 space-y-1">
                                            <p><span className="font-bold text-white">DNI / Cédula:</span> {player.dni || '—'}</p>
                                            <p><span className="font-bold text-white">Fecha de nacimiento:</span> {player.birthDate || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Si no hay ficha aún, sugerir registro */}
                    {!loadingPlayer && !player && (
                        <div className="bg-[#111] border border-dashed border-white/15 rounded-3xl p-6 md:p-8 text-center space-y-3">
                            <p className="text-sm font-bold text-gray-300">Aún no has creado tu ficha de jugador.</p>
                            <p className="text-[11px] text-gray-500 max-w-md mx-auto">
                                Completa tu perfil deportivo con tallas, tipo de sangre y datos de contacto para agilizar inscripciones y emergencias médicas.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/players/register')}
                                className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 active:scale-[0.98] transition-all"
                            >
                                Crear ficha de jugador
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal editar perfil */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-3xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black uppercase italic tracking-tight text-white">Actualizar perfil</h2>
                            <button
                                type="button"
                                onClick={() => !saving && setEditOpen(false)}
                                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Tu nombre"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-padel-primary outline-none transition-colors"
                                />
                            </div>
                            {error && <p className="text-xs text-red-400 font-bold">{error}</p>}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={saveProfile}
                                disabled={saving}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-padel-primary text-black font-black text-xs uppercase tracking-widest hover:bg-padel-primary/90 disabled:opacity-50 transition-all"
                            >
                                <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                            <button
                                type="button"
                                onClick={() => !saving && setEditOpen(false)}
                                className="px-6 py-3 rounded-2xl bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
