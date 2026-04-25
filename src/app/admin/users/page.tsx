'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, ROLES } from '@/lib/dataService';
import {
    Shield, User, Mail, RefreshCw, ChevronRight, Save,
    ShieldCheck, Target, Plus, Edit2, Key,
    X, ShieldAlert, ChevronLeft, Search,
    Filter, Layout, LogOut, CheckCircle2, Users, Settings, Phone,
    Copy, Check, Shirt, Footprints, HeartPulse, Instagram, ExternalLink, Trash2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CANCHA_IDS, getCanchaLabel } from '@/lib/markerCanchas';
import { formatDate } from '@/lib/formatters';
import { rtdbService } from '@/lib/rtdbService';
import { getAuthHeaders } from '@/lib/apiAuth';

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
    const [apiError, setApiError] = useState<'501' | '500' | 'network' | null>(null);
    const [fichaModalUser, setFichaModalUser] = useState<any | null>(null);
    /** contador de seguridad para borrar (3 clics) por jugador */
    const [deleteClickCount, setDeleteClickCount] = useState<Record<string, number>>({});
    /** id de fila (participant id o uid) cuyo código se acaba de copiar */
    const [copiedRowId, setCopiedRowId] = useState<string | null>(null);
    const [downloadingContractUid, setDownloadingContractUid] = useState<string | null>(null);

    const handleOpenContract = async (uid?: string) => {
        const userId = String(uid || '').trim();
        if (!userId) return;
        setDownloadingContractUid(userId);
        try {
            const authHeaders = await getAuthHeaders();
            const res = await fetch(`/api/admin/player-contract?uid=${encodeURIComponent(userId)}`, {
                headers: authHeaders,
            });
            const data = await res.json().catch(() => ({} as any));
            if (!res.ok) {
                throw new Error(data?.error || `Error ${res.status}`);
            }
            const html = String(data?.html || '');
            if (!html) throw new Error('No se pudo generar el contrato.');
            const w = window.open('', '_blank', 'noopener,noreferrer');
            if (!w) throw new Error('Tu navegador bloqueó la ventana emergente.');
            w.document.open();
            w.document.write(html);
            w.document.close();
        } catch (e: any) {
            alert(e?.message || 'No se pudo abrir el contrato firmado.');
        } finally {
            setDownloadingContractUid(null);
        }
    };

    const handleCopyUniqueCode = async (rowId: string, code?: string) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(String(code));
            setCopiedRowId(rowId);
            setTimeout(() => setCopiedRowId(prev => (prev === rowId ? null : prev)), 1600);
        } catch (e) {
            console.error('No se pudo copiar el código', e);
        }
    };

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
        setApiError(null);
        setLoading(true);
        try {
            const res = await fetch('/api/participants');
            if (res.ok) {
                const data = await res.json();
                setUsers(Array.isArray(data) ? data : []);
            } else if (res.status === 501) {
                setApiError('501');
                try {
                    const data = await dataService.getAllParticipants();
                    setUsers(data);
                } catch {
                    setUsers([]);
                }
            } else if (res.status >= 500) {
                const body = await res.json().catch(() => ({}));
                setApiError('500');
                setUsers([]);
                console.error('[Admin Users] API error:', res.status, body);
            } else {
                setUsers([]);
            }
        } catch (err) {
            console.error(err);
            setApiError('network');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteParticipant = async (id: string | undefined) => {
        if (!id) {
            alert('Este registro no tiene ID de participante; no se puede borrar desde aquí.');
            return;
        }
        const nextCount = (deleteClickCount[id] || 0) + 1;
        if (nextCount < 3) {
            setDeleteClickCount(prev => ({ ...prev, [id]: nextCount }));
            setTimeout(() => {
                setDeleteClickCount(prev => (prev[id] === nextCount ? { ...prev, [id]: 0 } : prev));
            }, 5000);
            return;
        }

        setDeleteClickCount(prev => ({ ...prev, [id]: 0 }));
        setUpdating(id);
        try {
            await dataService.deleteParticipant(id);
            setUsers(prev => prev.filter(u => u.id !== id));
            if (fichaModalUser?.id === id) setFichaModalUser(null);
        } catch (e) {
            console.error(e);
            alert('Error al eliminar el jugador');
        } finally {
            setUpdating(null);
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

                {/* Aviso: falta configurar service role para listar jugadores */}
                {apiError === '501' && (
                    <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                        <p className="text-sm font-bold mb-1">No se puede cargar la lista de jugadores</p>
                        <p className="text-xs text-amber-200/80 mb-3">
                            Añade la variable <code className="bg-black/30 px-1 rounded">SUPABASE_SERVICE_ROLE_KEY</code> en tu proyecto (Vercel → Settings → Environment Variables). Es la clave &quot;service_role&quot; de Supabase (Dashboard → Settings → API).
                        </p>
                        <button type="button" onClick={loadUsers} className="text-xs font-black uppercase tracking-widest text-amber-400 hover:text-amber-300">
                            Reintentar
                        </button>
                    </div>
                )}
                {apiError === '500' && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200">
                        <p className="text-sm font-bold">Error al cargar la lista desde el servidor.</p>
                        <button type="button" onClick={loadUsers} className="mt-2 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300">
                            Reintentar
                        </button>
                    </div>
                )}
                {apiError === 'network' && (
                    <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200">
                        <p className="text-sm font-bold">Error de conexión al cargar la lista.</p>
                        <button type="button" onClick={loadUsers} className="mt-2 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300">
                            Reintentar
                        </button>
                    </div>
                )}

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

                {/* Users List: foto, código, nombres, apellidos, teléfono y nivel en una sola línea (flex-nowrap + scroll si hace falta) */}
                <div className="flex flex-col gap-2">
                    <div className="hidden sm:flex flex-nowrap items-center gap-2 px-4 sm:px-6 lg:px-10 py-3 text-[8px] font-black uppercase tracking-[0.3em] text-gray-600 italic min-w-0">
                        <div className="w-11 shrink-0">FOTO</div>
                        <div className="w-[4.5rem] shrink-0">CÓDIGO</div>
                        <div className="min-w-[5.5rem] flex-1 basis-0">NOMBRES</div>
                        <div className="min-w-[5.5rem] flex-1 basis-0">APELLIDOS</div>
                        <div className="min-w-[6rem] flex-[1.15] basis-0">WHATSAPP</div>
                        <div className="w-[4.25rem] shrink-0 text-center">NIVEL</div>
                        <div className="w-[6.75rem] shrink-0 text-center">CONTRATO</div>
                        <div className="ml-auto flex w-[13.5rem] shrink-0 justify-end">ACCIONES</div>
                    </div>

                    {filteredUsers.map((u, idx) => (
                            <div
                                key={u.id || u.uid}
                                className={`group relative backdrop-blur-3xl border rounded-2xl transition-all duration-300 min-w-0 ${
                                    idx % 2 === 0
                                        ? 'bg-white/[0.07] border-white/20 hover:bg-padel-primary/[0.14] hover:border-padel-primary/35'
                                        : 'bg-[#050505] border-white/10 hover:bg-padel-primary/[0.10] hover:border-padel-primary/30'
                                }`}
                            >
                                <div className="flex min-h-[56px] min-w-0 flex-nowrap items-center gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-10 [scrollbar-width:thin]">
                                    {/* Foto */}
                                    <div className="flex shrink-0 items-center">
                                        <button
                                            type="button"
                                            onClick={() => setFichaModalUser(u)}
                                            className="block h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-white/10 bg-white/5 hover:border-padel-primary/50 focus:outline-none focus:ring-2 focus:ring-padel-primary/50 active:scale-95 lg:h-[52px] lg:w-[52px]"
                                            title="Ver ficha"
                                        >
                                            {u.photo ? (
                                                <img src={u.photo} alt={u.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-gray-700">
                                                    <User size={22} className="lg:h-[26px] lg:w-[26px]" />
                                                </div>
                                            )}
                                        </button>
                                    </div>

                                    {/* Código */}
                                    <div className="flex w-[4.5rem] shrink-0 items-center">
                                        {u.uniqueCode ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCopyUniqueCode(String(u.id || u.uid), u.uniqueCode)}
                                                className="inline-flex min-w-0 cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-left shadow-none hover:opacity-90 active:opacity-80"
                                                title="Copiar código"
                                            >
                                                <span className="min-w-0 font-mono text-xs font-black tabular-nums tracking-[0.15em] text-padel-primary sm:text-sm">
                                                    {u.uniqueCode}
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-600">—</span>
                                        )}
                                    </div>

                                    {/* Nombres */}
                                    <div className="min-w-[5.5rem] flex-1 basis-0">
                                        <h3 className="truncate text-sm font-black uppercase italic tracking-tighter text-white transition-colors group-hover:text-padel-primary">
                                            {u.name || (u.fullName?.split(' ')[0]) || 'S/N'}
                                        </h3>
                                    </div>

                                    {/* Apellidos */}
                                    <div className="min-w-[5.5rem] flex-1 basis-0">
                                        <h3 className="truncate text-sm font-black uppercase italic tracking-tighter text-gray-400">
                                            {u.lastName || (u.fullName?.split(' ').slice(1).join(' ')) || '—'}
                                        </h3>
                                    </div>

                                    {/* Teléfono */}
                                    <div className="min-w-[6rem] flex-[1.15] basis-0">
                                        <a
                                            href={u.phone ? `https://wa.me/${u.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${(u.name || u.fullName || '').split(' ')[0]}, te escribimos de Smart Padel! 🎾🚀`)}` : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/wa flex min-w-0 items-center gap-1.5 text-sm font-bold uppercase text-gray-400 transition-colors hover:text-green-500"
                                        >
                                            <Phone size={14} className="shrink-0 text-padel-primary/40 transition-colors group-hover/wa:text-green-500" />
                                            <span className="min-w-0 truncate">{u.phone || u.whatsapp || '—'}</span>
                                        </a>
                                    </div>

                                    {/* Nivel */}
                                    <div className="flex w-[4.25rem] shrink-0 items-center justify-center">
                                        <div className="max-w-full rounded-xl border border-padel-primary/20 bg-padel-primary/10 px-2 py-1.5">
                                            <span className="whitespace-nowrap text-[10px] font-black italic text-padel-primary sm:text-xs">NIVEL {u.level || '—'}</span>
                                        </div>
                                    </div>

                                    {/* Legal / contrato (profiles.legal_timestamp) */}
                                    <div className="flex w-[6.75rem] shrink-0 items-center justify-center">
                                        {u.termsAcceptedAt ? (
                                            <span className="flex items-center gap-1 whitespace-nowrap text-xs font-bold text-[#CCFF00]">
                                                ✅ CONTRATO OK
                                            </span>
                                        ) : (
                                            <span className="whitespace-nowrap text-xs font-bold text-red-500">
                                                ❌ SIN FIRMA
                                            </span>
                                        )}
                                    </div>

                                    {/* Acciones */}
                                    <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
                                        <button
                                            type="button"
                                            disabled={!u.id || updating === u.id}
                                            onClick={() => handleDeleteParticipant(u.id)}
                                            className="flex h-10 w-[6.25rem] shrink-0 items-center justify-center gap-1 rounded-xl border border-red-500/30 bg-red-500/15 px-2 font-black uppercase tracking-wider text-red-400 transition-all hover:bg-red-500/25 hover:text-red-300 disabled:pointer-events-none disabled:opacity-40 sm:w-28 sm:text-[10px] sm:tracking-widest"
                                            title="Se elimina al tercer clic"
                                        >
                                            {updating === u.id ? (
                                                <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                                            ) : (
                                                <Trash2 size={16} className="shrink-0" />
                                            )}
                                            <span className="truncate">Borrar</span>
                                        </button>
                                        <Link
                                            href={u.id ? `/players/register?edit=${u.id}` : '#'}
                                            className="flex h-10 w-[6.25rem] shrink-0 items-center justify-center gap-1 rounded-xl border border-padel-primary/20 bg-padel-primary/10 px-2 font-black uppercase tracking-wider text-padel-primary transition-all hover:bg-padel-primary hover:text-black sm:w-28 sm:text-[10px] sm:tracking-widest"
                                            title="Modificar ficha"
                                        >
                                            <Edit2 size={16} className="shrink-0" />
                                            <span className="truncate">Modificar</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </main>

            {/* Modal ficha del jugador */}
            <AnimatePresence>
                {fichaModalUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setFichaModalUser(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl"
                        >
                            <div className="sticky top-0 bg-[#0a0a0a]/95 border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
                                <h2 className="text-lg font-black uppercase italic tracking-tight text-white">
                                    Ficha de <span className="text-padel-primary">{fichaModalUser.name} {fichaModalUser.lastName}</span>
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setFichaModalUser(null)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                {/* Identificación */}
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2 mb-2">
                                        <Shield className="w-3.5 h-3.5" /> Identificación
                                    </p>
                                    <div className="text-xs text-gray-300 space-y-1">
                                        {fichaModalUser.uniqueCode && (
                                            <p className="flex items-center gap-2"><span className="font-bold text-white">Código:</span>
                                                <span className="font-mono text-padel-primary">{fichaModalUser.uniqueCode}</span>
                                                <button type="button" onClick={() => navigator.clipboard.writeText(fichaModalUser.uniqueCode)} className="text-gray-500 hover:text-padel-primary"><Copy size={12} /></button>
                                            </p>
                                        )}
                                        <p><span className="font-bold text-white">DNI:</span> {fichaModalUser.dni || '—'}</p>
                                        <p><span className="font-bold text-white">Fecha nac.:</span> {formatDate(fichaModalUser.birthDate)}</p>
                                        <p className="flex flex-wrap items-center gap-2 pt-1">
                                            <span className="font-bold text-white">Smart-Legal:</span>
                                            {fichaModalUser.termsAcceptedAt ? (
                                                <span className="text-xs font-bold text-[#CCFF00]">✅ CONTRATO OK</span>
                                            ) : (
                                                <span className="text-xs font-bold text-red-500">❌ SIN FIRMA</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {/* Tallas */}
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2 mb-2">
                                        <Shirt className="w-3.5 h-3.5" /> Tallas
                                    </p>
                                    <div className="text-xs text-gray-300 space-y-1">
                                        <p><span className="font-bold text-white">Franela:</span> {fichaModalUser.suitSize || '—'}</p>
                                        <p><span className="font-bold text-white">Short:</span> {fichaModalUser.shortSize || '—'}</p>
                                        <p><span className="font-bold text-white">Calzado:</span> {fichaModalUser.shoeSize || '—'}</p>
                                    </div>
                                </div>
                                {/* Salud */}
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2 mb-2">
                                        <HeartPulse className="w-3.5 h-3.5" /> Salud
                                    </p>
                                    <div className="text-xs text-gray-300 space-y-1">
                                        <p><span className="font-bold text-white">Tipo sangre:</span> {fichaModalUser.bloodType || '—'}</p>
                                        <p><span className="font-bold text-white">Alergias:</span> {fichaModalUser.allergies || '—'}</p>
                                        <p><span className="font-bold text-white">Cond. médicas:</span> {fichaModalUser.medicalConditions || '—'}</p>
                                    </div>
                                </div>
                                {/* Contacto */}
                                <div>
                                    <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2 mb-2">
                                        <Phone className="w-3.5 h-3.5" /> Contacto
                                    </p>
                                    <div className="text-xs text-gray-300 space-y-1">
                                        <p><span className="font-bold text-white">Teléfono:</span> {fichaModalUser.phone || '—'}</p>
                                        <p className="flex items-center gap-1"><Instagram className="w-3 h-3 text-gray-500" /><span><span className="font-bold text-white">Instagram:</span> {fichaModalUser.instagram ? `@${String(fichaModalUser.instagram).replace('@', '')}` : '—'}</span></p>
                                        <p><span className="font-bold text-white">Email:</span> {fichaModalUser.email || '—'}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10 flex gap-3">
                                    <Link
                                        href={fichaModalUser.id ? `/players/${fichaModalUser.id}` : '#'}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-padel-primary text-black font-black text-xs uppercase tracking-widest hover:bg-padel-primary/90 transition-colors"
                                    >
                                        <ExternalLink size={16} /> Ver perfil completo
                                    </Link>
                                    <Link
                                        href={fichaModalUser.id ? `/players/register?edit=${fichaModalUser.id}` : '#'}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-colors"
                                    >
                                        <Edit2 size={16} /> Editar
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleOpenContract(fichaModalUser.uid || fichaModalUser.owner_id)}
                                        disabled={downloadingContractUid === (fichaModalUser.uid || fichaModalUser.owner_id)}
                                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-padel-primary/15 border border-padel-primary/30 text-padel-primary font-bold text-xs uppercase tracking-widest hover:bg-padel-primary/25 transition-colors disabled:opacity-50"
                                    >
                                        <ExternalLink size={16} />
                                        {downloadingContractUid === (fichaModalUser.uid || fichaModalUser.owner_id) ? 'Generando...' : 'Contrato'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

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
