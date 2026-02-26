'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Plus, X, Wifi, WifiOff, Tv, Radio, Monitor,
    Play, Square, RefreshCw, ArrowLeft, Megaphone, Video,
    Eye, EyeOff, LayoutGrid, Maximize2, Settings, Save,
    Trash2, ExternalLink, Volume2, VolumeX
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { MatchStatus } from '@/types/tournament';

// ── Types ───────────────────────────────────────────────────────────────────
interface CameraFeed {
    id: string;
    label: string;
    url: string;
    type: 'youtube' | 'rtmp' | 'image' | 'hls' | 'iframe';
    courtId?: number;
    active: boolean;
}

const DEFAULT_CAMERAS: CameraFeed[] = [
    { id: 'cam_1', label: 'Pista 1', url: '', type: 'iframe', courtId: 1, active: true },
    { id: 'cam_2', label: 'Pista 2', url: '', type: 'iframe', courtId: 2, active: true },
    { id: 'cam_3', label: 'Pista 3', url: '', type: 'iframe', courtId: 3, active: true },
    { id: 'cam_4', label: 'Pista 4', url: '', type: 'iframe', courtId: 4, active: true },
];

function extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    return match ? match[1] : null;
}

// ── Camera Cell ─────────────────────────────────────────────────────────────
function CameraCell({
    cam, isFullscreen, onFullscreen, onEdit, liveMatchName
}: {
    cam: CameraFeed;
    isFullscreen: boolean;
    onFullscreen: () => void;
    onEdit: () => void;
    liveMatchName?: string;
}) {
    const [muted, setMuted] = useState(true);
    const hasStream = cam.url.trim() !== '';
    const ytId = cam.type === 'youtube' ? extractYouTubeId(cam.url) : null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#0c0c10] rounded-2xl overflow-hidden border border-white/[0.06] group"
        >
            {/* Stream area */}
            <div className="aspect-video w-full bg-black relative">
                {hasStream ? (
                    <>
                        {ytId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1`}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        ) : cam.type === 'iframe' ? (
                            <iframe
                                src={cam.url}
                                className="absolute inset-0 w-full h-full"
                                allowFullScreen
                            />
                        ) : cam.type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cam.url} alt={cam.label} className="absolute inset-0 w-full h-full object-cover" />
                        ) : (
                            <video
                                src={cam.url}
                                autoPlay
                                muted={muted}
                                loop
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        )}
                    </>
                ) : (
                    // Placeholder sin stream
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <Camera className="w-10 h-10 text-white/10" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Sin señal</p>
                        <button
                            onClick={onEdit}
                            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all"
                        >
                            + Configurar
                        </button>
                    </div>
                )}

                {/* LIVE badge si hay partido */}
                {liveMatchName && (
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-red-500/90 backdrop-blur-sm rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span className="text-[7px] font-black uppercase text-white tracking-widest">EN VIVO</span>
                    </div>
                )}

                {/* Controls overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                        {hasStream && (
                            <button
                                onClick={() => setMuted(m => !m)}
                                className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
                            >
                                {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            </button>
                        )}
                        <button
                            onClick={onEdit}
                            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
                        >
                            <Settings className="w-3 h-3" />
                        </button>
                        <button
                            onClick={onFullscreen}
                            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
                        >
                            <Maximize2 className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Label bar */}
            <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${hasStream ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' : 'bg-gray-700'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">{cam.label}</span>
                    {cam.courtId && (
                        <span className="text-[7px] text-white/20 font-mono">P{cam.courtId}</span>
                    )}
                </div>
                {liveMatchName && (
                    <span className="text-[7px] font-bold text-red-400 truncate max-w-[120px]">{liveMatchName}</span>
                )}
            </div>
        </motion.div>
    );
}

// ── Edit Camera Modal ────────────────────────────────────────────────────────
function EditCameraModal({
    cam, onSave, onDelete, onClose
}: {
    cam: CameraFeed;
    onSave: (updated: CameraFeed) => void;
    onDelete: () => void;
    onClose: () => void;
}) {
    const [form, setForm] = useState<CameraFeed>({ ...cam });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-[#111115] border border-white/[0.08] rounded-3xl p-6 space-y-5"
            >
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black italic uppercase tracking-tight">
                        Configurar Cámara
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600 block mb-1.5">Nombre</label>
                        <input
                            type="text"
                            value={form.label}
                            onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-padel-primary/40 transition-colors"
                            placeholder="Ej: Pista Central"
                        />
                    </div>

                    <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600 block mb-1.5">Tipo de fuente</label>
                        <div className="grid grid-cols-4 gap-1.5">
                            {(['youtube', 'iframe', 'image', 'hls'] as CameraFeed['type'][]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setForm(f => ({ ...f, type: t }))}
                                    className={`py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${form.type === t ? 'bg-padel-primary/10 border-padel-primary/30 text-padel-primary' : 'bg-white/[0.03] border-white/5 text-gray-600 hover:bg-white/[0.06]'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600 block mb-1.5">
                            URL {form.type === 'youtube' ? '(YouTube link)' : form.type === 'image' ? '(imagen)' : form.type === 'hls' ? '(.m3u8)' : '(iframe/embed)'}
                        </label>
                        <input
                            type="url"
                            value={form.url}
                            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-padel-primary/40 transition-colors font-mono text-[11px]"
                            placeholder="https://..."
                        />
                        {form.type === 'youtube' && form.url && extractYouTubeId(form.url) && (
                            <p className="text-[7px] text-green-500 mt-1 font-bold">✓ YouTube ID: {extractYouTubeId(form.url)}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-[8px] font-black uppercase tracking-widest text-gray-600 block mb-1.5">Pista (opcional)</label>
                        <input
                            type="number"
                            value={form.courtId || ''}
                            onChange={e => setForm(f => ({ ...f, courtId: parseInt(e.target.value) || undefined }))}
                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-padel-primary/40 transition-colors"
                            placeholder="1"
                            min={1}
                            max={10}
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onDelete}
                        className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { onSave(form); onClose(); }}
                        className="flex-1 py-2.5 rounded-xl bg-padel-primary text-black font-black uppercase tracking-widest text-[10px] hover:bg-padel-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Guardar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function BroadcastingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { isAdmin, isMarker } = useAuth();

    const [tournament, setTournament] = useState<any>(null);
    const [liveMatches, setLiveMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cameras, setCameras] = useState<CameraFeed[]>(DEFAULT_CAMERAS);
    const [editingCam, setEditingCam] = useState<CameraFeed | null>(null);
    const [fullscreenCam, setFullscreenCam] = useState<string | null>(null);
    const [globalAds, setGlobalAds] = useState(false);
    const [adUrl, setAdUrl] = useState('');
    const [savingAds, setSavingAds] = useState(false);
    const [columns, setColumns] = useState<2 | 3 | 4>(2);

    const canOperate = isAdmin || isMarker;

    // Firebase realtime
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'tournaments', id), snap => {
            if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() } as any;
                setTournament(data);

                // Cargar cámaras guardadas
                if (data.broadcastingSettings?.cameras) {
                    setCameras(data.broadcastingSettings.cameras);
                }
                // Cargar config de ads
                if (data.broadcastingSettings?.globalAds !== undefined) {
                    setGlobalAds(data.broadcastingSettings.globalAds);
                }
                if (data.broadcastingSettings?.adUrl) {
                    setAdUrl(data.broadcastingSettings.adUrl);
                }

                // Partidos en vivo
                const live = (data.matches || []).filter((m: any) => m.status === MatchStatus.LIVE);
                setLiveMatches(live);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [id]);

    const saveCameras = async (updated: CameraFeed[]) => {
        setCameras(updated);
        await updateDoc(doc(db, 'tournaments', id), {
            'broadcastingSettings.cameras': updated,
            updatedAt: new Date(),
        });
    };

    const handleSaveCamera = (updated: CameraFeed) => {
        saveCameras(cameras.map(c => c.id === updated.id ? updated : c));
    };

    const handleDeleteCamera = (camId: string) => {
        saveCameras(cameras.filter(c => c.id !== camId));
    };

    const addCamera = () => {
        const newCam: CameraFeed = {
            id: `cam_${Date.now()}`,
            label: `Cámara ${cameras.length + 1}`,
            url: '',
            type: 'iframe',
            active: true,
        };
        setEditingCam(newCam);
        setCameras(prev => [...prev, newCam]);
    };

    const saveGlobalAds = async () => {
        setSavingAds(true);
        try {
            // Actualizar todos los partidos con forcedAds
            const updatedMatches = (tournament?.matches || []).map((m: any) => ({
                ...m,
                forcedAds: globalAds,
                current_ad_url: adUrl || undefined,
            }));
            await updateDoc(doc(db, 'tournaments', id), {
                'broadcastingSettings.globalAds': globalAds,
                'broadcastingSettings.adUrl': adUrl,
                matches: updatedMatches,
                updatedAt: new Date(),
            });
        } finally {
            setSavingAds(false);
        }
    };

    // Obtener nombre del partido en vivo para una pista
    const getLiveMatchForCourt = (courtId?: number) => {
        if (!courtId) return undefined;
        const m = liveMatches.find((m: any) =>
            m.court === courtId || m.courtIndex === courtId - 1
        );
        if (!m) return undefined;
        const t = tournament?.teams;
        const t1 = m.team1Index > 0 ? t?.[m.team1Index - 1] : null;
        const t2 = m.team2Index > 0 ? t?.[m.team2Index - 1] : null;
        const n1 = t1?.p1?.name?.split(' ')[0] || 'Eq1';
        const n2 = t2?.p1?.name?.split(' ')[0] || 'Eq2';
        return `${n1} vs ${n2}`;
    };

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
        </div>
    );

    const gridCols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-outfit">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-20 md:pl-24">

                {/* ── HEADER ─────────────────────────────────────────────── */}
                <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/[0.04]">
                    <div className="flex items-center gap-3">
                        <Link href={`/tournaments/${id}/control`}
                            className="p-2 rounded-xl hover:bg-white/5 text-gray-600 hover:text-white transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="p-2.5 bg-orange-500/10 rounded-xl border border-orange-500/20">
                            <Camera className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-base font-black italic uppercase tracking-tighter">Broadcasting</h1>
                            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.15em]">
                                {tournament?.name} · {cameras.length} cámaras · {liveMatches.length} en vivo
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Columns selector */}
                        <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                            {([2, 3, 4] as const).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setColumns(n)}
                                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${columns === n ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>

                        {/* Add camera */}
                        <button
                            onClick={addCamera}
                            className="flex items-center gap-2 px-3 py-2 bg-padel-primary/10 border border-padel-primary/20 rounded-xl text-padel-primary text-[9px] font-black uppercase tracking-widest hover:bg-padel-primary/20 transition-all"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Cámara
                        </button>

                        {/* Display link */}
                        <Link
                            href={`/display/tv/1`}
                            target="_blank"
                            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Pizarra TV
                        </Link>
                    </div>
                </header>

                {/* ── ADS CONTROL BAR ────────────────────────────────────── */}
                <div className="flex-shrink-0 px-4 lg:px-6 py-3 border-b border-white/[0.04] bg-yellow-500/[0.02]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Tv className="w-4 h-4 text-yellow-400/60" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-yellow-400/60">Modo Publicidad Global</span>
                        </div>

                        <input
                            type="url"
                            value={adUrl}
                            onChange={e => setAdUrl(e.target.value)}
                            placeholder="URL de imagen o video publicitario..."
                            className="flex-1 bg-black/40 border border-white/[0.06] rounded-lg px-3 py-1.5 text-[10px] text-white font-mono outline-none focus:border-yellow-400/30 transition-colors"
                        />

                        <button
                            onClick={() => setGlobalAds(v => !v)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${globalAds
                                ? 'bg-yellow-400/15 border-yellow-400/40 text-yellow-400'
                                : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:border-yellow-400/20 hover:text-yellow-400'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${globalAds ? 'bg-yellow-400 animate-pulse' : 'bg-gray-700'}`} />
                            {globalAds ? 'ADS ACTIVO' : 'Activar ADS'}
                        </button>

                        <button
                            onClick={saveGlobalAds}
                            disabled={savingAds || !canOperate}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                        >
                            {savingAds ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                            Aplicar
                        </button>
                    </div>
                </div>

                {/* ── CAMERA GRID ────────────────────────────────────────── */}
                <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar p-4 lg:p-6">
                    {cameras.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30">
                            <Camera className="w-16 h-16" />
                            <p className="font-black italic uppercase tracking-widest text-sm">Sin cámaras configuradas</p>
                            <button onClick={addCamera} className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                + Añadir primera cámara
                            </button>
                        </div>
                    ) : (
                        <div className={`grid ${gridCols} gap-3`}>
                            {cameras.filter(c => c.active).map(cam => (
                                <CameraCell
                                    key={cam.id}
                                    cam={cam}
                                    isFullscreen={fullscreenCam === cam.id}
                                    onFullscreen={() => setFullscreenCam(f => f === cam.id ? null : cam.id)}
                                    onEdit={() => setEditingCam(cam)}
                                    liveMatchName={getLiveMatchForCourt(cam.courtId)}
                                />
                            ))}

                            {/* Add camera card */}
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={addCamera}
                                className="aspect-video rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-2 hover:border-padel-primary/30 hover:bg-padel-primary/[0.02] transition-all group"
                            >
                                <Plus className="w-6 h-6 text-white/20 group-hover:text-padel-primary/60 transition-colors" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-padel-primary/60 transition-colors">
                                    Añadir cámara
                                </span>
                            </motion.button>
                        </div>
                    )}
                </main>

                {/* ── LIVE MATCHES STATUS BAR ─────────────────────────────── */}
                <footer className="flex-shrink-0 h-9 flex items-center gap-4 px-4 lg:px-6 border-t border-white/[0.04] bg-black/20">
                    <div className="flex items-center gap-1.5">
                        <Wifi className="w-3 h-3 text-green-500" />
                        <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">Firebase Sync</span>
                    </div>
                    {liveMatches.length > 0 ? (
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_red]" />
                            <span className="text-[7px] font-black uppercase text-red-400/80 tracking-widest">
                                {liveMatches.length} partido{liveMatches.length > 1 ? 's' : ''} en vivo
                            </span>
                        </div>
                    ) : (
                        <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">Sin partidos en vivo</span>
                    )}
                    <span className="ml-auto text-[7px] font-black tracking-[0.25em] uppercase text-gray-800 italic">
                        PADEL SMART Pro · Broadcasting
                    </span>
                </footer>
            </div>

            {/* ── EDIT MODAL ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {editingCam && (
                    <EditCameraModal
                        cam={editingCam}
                        onSave={handleSaveCamera}
                        onDelete={() => { handleDeleteCamera(editingCam.id); setEditingCam(null); }}
                        onClose={() => setEditingCam(null)}
                    />
                )}
            </AnimatePresence>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
