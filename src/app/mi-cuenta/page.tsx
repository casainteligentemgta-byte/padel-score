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
    HeartPulse,
    Copy,
    Check,
    CalendarDays,
    Users,
    LogOut,
    ChevronLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';
import LoginButton from '@/components/LoginButton';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/formatters';

export default function MiCuentaPage() {
    const { user, profile, loading: authLoading, refreshProfile, logout } = useAuth();
    const router = useRouter();
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [player, setPlayer] = useState<any | null>(null);
    const [loadingPlayer, setLoadingPlayer] = useState(true);
    const [copied, setCopied] = useState(false);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loadingInvs, setLoadingInvs] = useState(true);
    const [respondingId, setRespondingId] = useState<string | null>(null);

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

    // Cargar invitaciones del Jugador B
    useEffect(() => {
        const loadInvs = async () => {
            if (!user?.uid) return;
            try {
                const list = await dataService.getMyInvitations(user.uid);
                setInvitations(list);
            } catch (err) {
                console.error("Error loading invitations:", err);
            } finally {
                setLoadingInvs(false);
            }
        };
        if (!authLoading && user) loadInvs();
    }, [authLoading, user]);

    // Suscripción Realtime para invitaciones
    useEffect(() => {
        if (!user?.uid) return;
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const channel = supabase
            .channel('invitations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'teams',
                    filter: `player_b_id=eq.${user.uid}`
                },
                () => {
                    // Recargar invitaciones al haber cambios
                    dataService.getMyInvitations(user.uid).then(setInvitations);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.uid]);

    const handleInvitationResponse = async (id: string, status: 'accepted' | 'rejected') => {
        setRespondingId(id);
        setError('');
        try {
            await dataService.respondToInvitation(id, status);
            // Refrescar lista
            const list = await dataService.getMyInvitations(user!.uid);
            setInvitations(list);
            if (status === 'accepted') {
                // Si aceptó, tal vez redirigir o mostrar éxito
                alert('¡Invitación aceptada con éxito! Ya estás inscrito.');
            }
        } catch (err: any) {
            setError(err.message || 'Error al procesar la invitación.');
        } finally {
            setRespondingId(null);
        }
    };

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
            <div className="flex items-center gap-3 mb-8 flex-shrink-0 pl-6 md:pl-10 pr-4 pt-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    aria-label="Volver"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                </button>
                <BouncingBall size={26} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Mi perfil</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Datos de tu cuenta y ficha de jugador</p>
                </div>
            </div>
            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* SECCIÓN DE INVITACIONES PENDIENTES */}
                    {!loadingInvs && invitations.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-[#ccff00] px-2 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Invitaciones Pendientes
                            </h2>
                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold mb-4">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-3">
                                {invitations.map((inv) => (
                                    <div key={inv.id} className="bg-[#111] border border-[#ccff00]/20 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="bg-[#ccff00]/10 text-[#ccff00] text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                                                Reserva Activa
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                                                    {inv.tournament_name || 'Torneo'}
                                                </p>
                                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight">
                                                    Invitación de {inv.inviter_name}
                                                </h3>
                                                <p className="text-xs text-padel-primary font-bold">Categoría: {inv.category}</p>
                                            </div>

                                            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Nota importante:</p>
                                                <p className="text-[11px] text-gray-300 leading-relaxed">
                                                    ¡Tienes un lugar reservado! Acepta antes de que expire el tiempo para asegurar tu participación.
                                                </p>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => handleInvitationResponse(inv.id, 'accepted')}
                                                    disabled={respondingId === inv.id}
                                                    className="flex-1 py-3 rounded-2xl bg-[#ccff00] text-black font-black uppercase text-[10px] tracking-widest hover:bg-[#ccff00]/90 disabled:opacity-50 transition-all"
                                                >
                                                    {respondingId === inv.id ? 'Procesando...' : 'Aceptar Inscripción'}
                                                </button>
                                                <button
                                                    onClick={() => handleInvitationResponse(inv.id, 'rejected')}
                                                    disabled={respondingId === inv.id}
                                                    className="px-6 py-3 rounded-2xl bg-white/5 text-red-500 font-black uppercase text-[10px] tracking-widest hover:bg-red-500/10 transition-all"
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                                        <div className="min-w-0 flex flex-col justify-center">
                                            <div className="flex items-center gap-2 leading-tight">
                                                <p className="font-black uppercase tracking-wider text-white truncate">
                                                    {player.name} {player.lastName}
                                                </p>
                                                <button
                                                    type="button"
                                                    onClick={() => router.push(`/players/register?edit=${player.id}`)}
                                                    className="p-1 rounded-full bg-white/5 hover:bg-padel-primary hover:text-black text-gray-400 transition-colors flex-shrink-0"
                                                    title="Modificar ficha de jugador"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 flex flex-wrap items-center gap-2 leading-tight">
                                                <span>Posición:</span>
                                                <span className="text-padel-primary">
                                                    {player.position || 'Drive / Revés'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="px-2 py-1 rounded-full bg-padel-primary/10 text-padel-primary text-[10px] font-black uppercase tracking-widest">
                                                Nivel {player.level ?? 4}
                                            </span>
                                            <span className="px-2 py-1 rounded-full bg-white/5 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                                                {player.position || 'Posición mixta'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => router.push(`/players/register?edit=${player.id}`)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-padel-primary hover:text-black text-gray-400 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <Edit3 className="w-3 h-3" />
                                            Editar Ficha
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-4 mt-2">
                                    {/* Identificación */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                            <Shield className="w-4 h-4" /> Identificación
                                        </p>
                                        <div className="text-xs text-gray-300 space-y-1">
                                            <p><span className="font-bold text-white">DNI / Cédula:</span> {player.dni || '—'}</p>
                                            <p><span className="font-bold text-white">Fecha de nacimiento:</span> {formatDate(player.birthDate)}</p>
                                        </div>
                                    </div>

                                    {/* Tallas */}
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
                                            <Shirt className="w-4 h-4" /> Tallas
                                        </p>
                                        <div className="text-xs text-gray-300 space-y-1.5">
                                            <p className="flex items-center gap-1 leading-tight">
                                                <Shirt className="w-3 h-3 text-gray-500" />
                                                <span><span className="font-bold text-white">Franela:</span> {player.suitSize || '—'}</span>
                                            </p>
                                            <p className="flex items-center gap-1 leading-tight">
                                                <Shirt className="w-3 h-3 text-gray-500" />
                                                <span><span className="font-bold text-white">Short:</span> {player.shortSize || '—'}</span>
                                            </p>
                                            <p className="flex items-center gap-1 leading-tight">
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

                                    {/* Código de Vinculación oculto por solicitud del usuario */}
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

                    {/* Tarjeta de cuenta (correo, rol) oculta por solicitud del usuario */}
                </div>

                {/* Botón de Cerrar Sesión */}
                <div className="pt-8">
                    <button
                        onClick={async () => {
                            await logout();
                            router.replace('/login');
                        }}
                        className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl bg-red-500/10 text-red-500 font-black uppercase italic tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-[0.98]"
                    >
                        <LogOut className="w-5 h-5" />
                        Finalizar Sesión
                    </button>
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
