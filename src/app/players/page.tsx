'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import {
    Users,
    Search,
    Trash2,
    Copy,
    Check,
    ExternalLink,
    RefreshCw,
    Edit2,
    X,
    Save,
    Camera
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Suspense } from 'react';
import { formatDNI } from '@/lib/formatters';

import Sidebar from '@/components/Sidebar';

import { useSearchParams, useRouter } from 'next/navigation';

function PlayersListContent() {
    const { user, loading: authLoading, isAdmin, profileLoading } = useAuth();
    const [players, setPlayers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingPlayer, setEditingPlayer] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [copiedPlayerId, setCopiedPlayerId] = useState<string | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');

    useEffect(() => {
        if (!authLoading && !user) {
            setLoading(false);
            return;
        }
        if (authLoading || !user) return;
        // Si aún no sabemos el rol, esperar: evita pedir "mis jugadores" y luego toda la API (admin por rol en BD).
        if (!isAdmin && profileLoading) {
            setLoading(true);
            return;
        }

        let cancelled = false;
        setLoading(true);
        (async () => {
            try {
                if (isAdmin) {
                    const res = await fetch('/api/participants');
                    if (cancelled) return;
                    if (res.ok) {
                        const data = await res.json();
                        setPlayers(Array.isArray(data) ? data : []);
                        return;
                    }
                    if (res.status === 501) {
                        const data = await dataService.getAllParticipants();
                        if (!cancelled) setPlayers(data);
                    } else if (!cancelled) {
                        setPlayers([]);
                    }
                } else {
                    const data = await dataService.getMyParticipants(user.uid);
                    if (!cancelled) setPlayers(data);
                }
            } catch (err) {
                console.error(err);
                if (!cancelled) setPlayers([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user, authLoading, isAdmin, profileLoading]);

    useEffect(() => {
        if (editId && players.length > 0) {
            const p = players.find(p => p.id === editId);
            if (p) {
                setEditingPlayer({ ...p });
                setIsEditModalOpen(true);
            }
        }
    }, [editId, players]);

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (!confirm('¿Estás seguro de eliminar este jugador? Esta acción es irreversible.')) return;
        try {
            await dataService.deleteParticipant(id);
            setPlayers(players.filter(p => p.id !== id));
        } catch (error) {
            console.error(error);
            alert('Error al eliminar');
        }
    };

    const handleEdit = (player: any) => {
        setEditingPlayer({ ...player });
        setIsEditModalOpen(true);
    };

    const handleCopyCode = async (playerId: string, code?: string) => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(String(code));
            setCopiedPlayerId(playerId);
            setTimeout(() => setCopiedPlayerId(prev => (prev === playerId ? null : prev)), 1400);
        } catch (e) {
            console.error('No se pudo copiar el código', e);
        }
    };

    const closeCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    };

    const handleUpdate = async () => {
        if (!editingPlayer) return;
        setSaving(true);
        try {
            await dataService.updateParticipant(editingPlayer.id, editingPlayer);
            setPlayers(players.map(p => p.id === editingPlayer.id ? editingPlayer : p));
            closeCamera();
            setIsEditModalOpen(false);
            setEditingPlayer(null);
            // limpiar query ?edit= para que no se reabra el modal
            router.replace('/players');
        } catch (error) {
            console.error(error);
            alert('Error al actualizar el perfil');
        } finally {
            setSaving(false);
        }
    };

    const openCamera = async () => {
        if (isCameraOpen) return;
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                alert('La cámara no es compatible en este navegador.');
                return;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
            streamRef.current = stream;
            setIsCameraOpen(true);
        } catch (error) {
            console.error(error);
            alert('No se pudo acceder a la cámara.');
        }
    };

    const takePhoto = () => {
        if (!videoRef.current || !editingPlayer) return;
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const width = video.videoWidth || 320;
        const height = video.videoHeight || 320;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setEditingPlayer({ ...editingPlayer, photo: dataUrl });
        closeCamera();
    };

    const filteredPlayers = players.filter(p =>
        (p.name + ' ' + p.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.dni || '').includes(searchTerm)
    );

    if (authLoading || loading || (user && !isAdmin && profileLoading)) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <header className="mb-3 flex-shrink-0 pl-24 md:pl-28">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                    <span className="text-padel-primary">Jugadores</span>
                </h1>
                <p className="text-gray-500 mt-2 font-medium">Gestiona los perfiles y estadísticas de tus jugadores.</p>
            </header>

            <div className="mb-3 relative flex-shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-padel-primary transition-colors text-sm font-bold italic"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="ipad-scroll-area pb-4">
                <div className="glass overflow-hidden overflow-x-auto">
                    <table className="w-full text-left font-public-sans">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Jugador</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Nivel/Pos</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Contacto</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-500 italic font-medium">
                                        No se encontraron jugadores que coincidan con la búsqueda.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map((player) => (
                                    <tr key={player.id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/5 group-hover:border-padel-primary/30 transition-all">
                                                    {player.photo ? (
                                                        <img src={player.photo} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                                    ) : (
                                                        <Users className="w-7 h-7 text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-base tracking-tight">{player.name} {player.lastName}</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyCode(player.id, player.uniqueCode)}
                                                        onTouchStart={() => handleCopyCode(player.id, player.uniqueCode)}
                                                        className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-gray-400 font-black tracking-widest uppercase hover:text-padel-primary transition-colors"
                                                        title="Tocar para copiar código"
                                                    >
                                                        Código: <span className="text-white">{player.uniqueCode || '------'}</span>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        {copiedPlayerId === player.id && <Check className="w-3.5 h-3.5 text-padel-primary" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="inline-flex items-center px-3 py-1 rounded-full bg-padel-primary/10 text-padel-primary text-xs font-bold w-fit uppercase italic tracking-tighter">
                                                    Nivel {player.level || '4'}
                                                </div>
                                                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest pl-1">{player.position}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">
                                            <div className="space-y-1">
                                                <p className="text-gray-300 text-sm"><span className="text-gray-500">WhatsApp:</span> {player.phone || 'S/N'}</p>
                                                <p className="text-gray-500 italic">{player.instagram ? `@${player.instagram}` : player.email || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleDelete(player.id)}
                                                        className="h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 text-white hover:bg-red-500 transition-all shadow-lg font-black text-[10px] uppercase tracking-widest"
                                                        title="Borrar jugador"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>Borrar</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(player)}
                                                    className="h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-padel-primary/10 text-padel-primary hover:bg-padel-primary hover:text-black transition-all shadow-lg font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    <span>Modificar</span>
                                                </button>
                                                <Link
                                                    href={`/players/${player.id}`}
                                                    className="h-10 px-3 flex items-center justify-center gap-1.5 rounded-xl bg-white/5 text-gray-300 hover:bg-padel-primary hover:text-black transition-all shadow-lg font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    <span>Perfil</span>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>


            </div>

            {/* Modal de Edición */}
            <AnimatePresence>
                {isEditModalOpen && editingPlayer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-[#0f0f0f] w-full max-w-lg rounded-[32px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-padel-primary/20 flex items-center justify-center">
                                        <Edit2 className="w-5 h-5 text-padel-primary" />
                                    </div>
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Editar Perfil</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        closeCamera();
                                        setIsEditModalOpen(false);
                                        setEditingPlayer(null);
                                        router.replace('/players');
                                    }}
                                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                {/* Foto */}
                                <div className="flex flex-col items-center gap-3">
                                    <label className="relative group cursor-pointer block">
                                        <div className="w-24 h-24 rounded-full bg-white/5 border-4 border-white/5 overflow-hidden">
                                            {editingPlayer.photo ? (
                                                <img src={editingPlayer.photo} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Users className="w-10 h-10 text-gray-700 m-auto mt-6" />
                                            )}
                                        </div>
                                        <span className="absolute bottom-0 right-0 w-8 h-8 bg-padel-primary rounded-full flex items-center justify-center text-black shadow-lg border-2 border-[#0f0f0f]">
                                            <Camera className="w-4 h-4" />
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setEditingPlayer({ ...editingPlayer, photo: reader.result as string });
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>

                                    {!isCameraOpen && (
                                        <button
                                            type="button"
                                            onClick={openCamera}
                                            className="px-4 py-2 rounded-2xl border border-padel-primary/40 bg-padel-primary/10 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-padel-primary hover:text-black transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Usar cámara
                                        </button>
                                    )}

                                    {isCameraOpen && (
                                        <div className="w-full max-w-xs space-y-3">
                                            <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black">
                                                <video
                                                    ref={videoRef}
                                                    className="w-full h-48 object-cover"
                                                    autoPlay
                                                    muted
                                                    playsInline
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={takePhoto}
                                                    className="flex-1 px-4 py-2 rounded-2xl bg-padel-primary text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-colors"
                                                >
                                                    Disparar foto
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={closeCamera}
                                                    className="flex-1 px-4 py-2 rounded-2xl border border-white/20 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                                                >
                                                    Cerrar cámara
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 pb-2">Datos personales</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.name || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Apellido</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.lastName || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, lastName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Cédula / DNI</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.dni || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, dni: formatDNI(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Fecha de nacimiento</label>
                                        <input
                                            type="date"
                                            value={editingPlayer.birthDate || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, birthDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nivel (1-7)</label>
                                        <select
                                            value={editingPlayer.level ?? 4}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, level: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {[1, 2, 3, 4, 5, 6, 7].map(l => <option key={l} value={l} className="bg-[#0f0f0f]">Nivel {l}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Posición</label>
                                        <select
                                            value={editingPlayer.position || 'Drive'}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, position: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {['Drive', 'Revés', 'Ambos'].map(p => <option key={p} value={p} className="bg-[#0f0f0f]">{p}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 pb-2 pt-2">Contacto</p>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Email</label>
                                        <input
                                            type="email"
                                            value={editingPlayer.email || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, email: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Teléfono</label>
                                        <input
                                            type="text"
                                            value={editingPlayer.phone || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, phone: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Instagram (@usuario)</label>
                                        <input
                                            type="text"
                                            placeholder="@usuario"
                                            value={editingPlayer.instagram || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, instagram: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 pb-2 pt-2">Tallas</p>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Franela</label>
                                        <select
                                            value={editingPlayer.suitSize || 'M'}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, suitSize: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s} className="bg-[#0f0f0f]">{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Short</label>
                                        <select
                                            value={editingPlayer.shortSize || 'M'}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, shortSize: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s} className="bg-[#0f0f0f]">{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Calzado</label>
                                        <input
                                            type="text"
                                            placeholder="40"
                                            value={editingPlayer.shoeSize || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, shoeSize: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-white/10 pb-2 pt-2">Salud</p>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Tipo de sangre</label>
                                        <select
                                            value={editingPlayer.bloodType || 'O+'}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, bloodType: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all appearance-none"
                                        >
                                            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => <option key={b} value={b} className="bg-[#0f0f0f]">{b}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Alergias</label>
                                        <input
                                            type="text"
                                            placeholder="Ninguna o describir"
                                            value={editingPlayer.allergies || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, allergies: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Condiciones médicas</label>
                                        <input
                                            type="text"
                                            placeholder="Ninguna o describir"
                                            value={editingPlayer.medicalConditions || ''}
                                            onChange={e => setEditingPlayer({ ...editingPlayer, medicalConditions: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-padel-primary transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/10 flex gap-4">
                                <button
                                    onClick={() => {
                                        closeCamera();
                                        setIsEditModalOpen(false);
                                        setEditingPlayer(null);
                                        router.replace('/players');
                                    }}
                                    className="flex-1 py-4 rounded-2xl border border-white/10 font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className="flex-1 py-4 rounded-2xl bg-padel-primary text-black font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function PlayersListPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        }>
            <PlayersListContent />
        </Suspense>
    );
}
