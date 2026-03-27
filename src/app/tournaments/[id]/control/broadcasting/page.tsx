'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera, Plus, X, Wifi, WifiOff, Tv, Radio, Monitor,
    Play, Square, RefreshCw, Megaphone, Video,
    Eye, EyeOff, LayoutGrid, Maximize2, Settings, Save,
    Trash2, ExternalLink, Volume2, VolumeX, Activity,
    Shield, Zap, Globe, Gauge, AlertTriangle, MonitorPlay,
    Cpu, HardDrive, Network, Clock, Info
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { useRouteSegment } from '@/lib/useRouteSegment';
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            onDoubleClick={onFullscreen}
            className={`relative group rounded-3xl overflow-hidden border transition-all duration-500 cursor-pointer ${hasStream ? 'border-white/10 bg-black' : 'border-white/5 bg-[#0a0a0c]'
                }`}
        >
            {/* Stream area */}
            <div className="aspect-video w-full bg-black relative group/stream overflow-hidden">
                {hasStream ? (
                    <div className="w-full h-full">
                        {ytId ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
                                className="absolute inset-0 w-full h-full pointer-events-none"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        ) : cam.type === 'iframe' ? (
                            <iframe
                                src={cam.url}
                                className="absolute inset-0 w-full h-full border-0"
                                allowFullScreen
                            />
                        ) : cam.type === 'image' ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={cam.url} alt={cam.label} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        ) : (
                            <video
                                src={cam.url}
                                autoPlay
                                muted={muted}
                                loop
                                className="absolute inset-0 w-full h-full object-cover opacity-90"
                            />
                        )}
                        {/* Overlay to prevent interaction if desired, or let iframe handle it */}
                        <div className="absolute inset-0 bg-transparent z-10" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]">
                        <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.02]">
                            <Camera className="w-5 h-5 text-white/10" />
                        </div>
                        <div className="text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-1">Señal Perdida</p>
                            <button
                                onClick={onEdit}
                                className="text-[8px] font-black uppercase tracking-widest text-padel-primary/40 hover:text-padel-primary transition-colors underline underline-offset-4"
                            >
                                Configurar
                            </button>
                        </div>
                    </div>
                )}

                {/* Scanline Effect */}
                {hasStream && <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-20 bg-[length:100%_4px,3px_100%]" />}

                {/* Status Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-30">
                    {liveMatchName && (
                        <motion.div
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="flex items-center gap-2 px-2.5 py-1 bg-red-600 rounded-lg shadow-lg shadow-red-600/20"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-[8px] font-black uppercase text-white tracking-widest">LIVE</span>
                        </motion.div>
                    )}
                    {hasStream && (
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg">
                            <div className="flex gap-0.5">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-0.5 rounded-full bg-padel-primary ${i < 4 ? 'h-2' : 'h-3'}`} />
                                ))}
                            </div>
                            <span className="text-[7px] font-black text-padel-primary/80 uppercase tracking-tighter">HD 1080p</span>
                        </div>
                    )}
                </div>

                {/* Corner Label */}
                <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-1">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[7px] font-mono text-padel-primary/60 tracking-tighter flex items-center gap-1.5 ring-1 ring-white/5 shadow-2xl">
                        <Monitor className="w-2.5 h-2.5" />
                        NODE_{cam.id.slice(-4).toUpperCase()}
                    </div>
                    {hasStream && (
                        <div className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-md text-[6px] font-black text-green-400 uppercase tracking-widest">
                            Stable
                        </div>
                    )}
                </div>

                {/* Controls Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/stream:opacity-100 transition-all duration-300 z-40">
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex gap-1.5">
                            <button
                                onClick={onEdit}
                                className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white/70 hover:bg-padel-primary hover:text-black hover:border-padel-primary transition-all"
                            >
                                <Settings className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={onFullscreen}
                                className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 text-white/70 hover:bg-white/20 transition-all"
                            >
                                <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        {hasStream && (
                            <button
                                onClick={() => setMuted(m => !m)}
                                className={`p-2 backdrop-blur-md rounded-xl border transition-all ${muted ? 'bg-red-500/20 border-red-500/20 text-red-400' : 'bg-white/10 border-white/10 text-white/70 hover:bg-white/20'}`}
                            >
                                {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Label bar */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-white/[0.03] to-transparent border-t border-white/[0.04]">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${hasStream ? 'bg-padel-primary' : 'bg-gray-800'} ${hasStream ? 'shadow-[0_0_8px_rgba(204,255,0,0.5)]' : ''}`} />
                        <span className="text-[11px] font-black uppercase tracking-[0.1em] text-white/90">{cam.label}</span>
                    </div>
                    {liveMatchName ? (
                        <div className="flex items-center gap-2">
                            <div className="px-1.5 py-0.5 bg-red-500/10 border border-red-500/20 rounded uppercase text-[7px] font-black text-red-500">Live Match</div>
                            <span className="text-[9px] font-bold text-white/40 truncate leading-none uppercase tracking-tight">
                                {liveMatchName}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3 bg-white/10 rounded-full" />
                            <span className="text-[8px] text-white/20 font-mono uppercase tracking-widest">Assign: Court {cam.courtId || '--'}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 pr-4 border-r border-white/5">
                        <svg className="w-12 h-6 text-padel-primary/20" viewBox="0 0 100 40">
                            <path d="M0 20 Q 10 5, 20 20 T 40 20 T 60 20 T 80 20 T 100 20" fill="none" stroke="currentColor" strokeWidth="2" className="animate-[dash_2s_linear_infinite]" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div 
                                    key={i} 
                                    className={`w-1 h-2 rounded-[0.5px] transition-colors duration-700 ${
                                        hasStream 
                                            ? i <= 4 ? 'bg-padel-primary/60' : 'bg-white/5' 
                                            : 'bg-white/5'
                                    }`} 
                                />
                            ))}
                        </div>
                        <span className="text-[6px] font-black text-white/20 uppercase tracking-[0.2em] leading-none">Telemetry Out</span>
                    </div>
                </div>
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
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Info className="w-3.5 h-3.5 text-gray-700" />
                            </div>
                            <input
                                type="text"
                                value={form.label}
                                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-padel-primary/40 transition-colors"
                                placeholder="Ej: Pista Central"
                            />
                        </div>
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
                        <div className="relative">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Globe className="w-3.5 h-3.5 text-gray-700" />
                            </div>
                            <input
                                type="url"
                                value={form.url}
                                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                                className="w-full bg-black border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-padel-primary/40 transition-colors font-mono text-[11px]"
                                placeholder="https://..."
                            />
                        </div>
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
export default function BroadcastingPage() {
    const id = useRouteSegment('id');
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
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const canOperate = isAdmin || isMarker;

    // Supabase Real-time Synchronization
    useEffect(() => {
        setLoading(true);
        
        // 1. Subscribe to tournament configuration
        const unsubTournament = dataService.subscribeToTournament(id, (data) => {
            if (data) {
                setTournament(data);

                // Load saved cameras
                if (data.broadcastingSettings?.cameras) {
                    setCameras(data.broadcastingSettings.cameras);
                }
                // Load ads configuration
                if (data.broadcastingSettings?.globalAds !== undefined) {
                    setGlobalAds(data.broadcastingSettings.globalAds);
                }
                if (data.broadcastingSettings?.adUrl) {
                    setAdUrl(data.broadcastingSettings.adUrl);
                }
            }
            setLoading(false);
        });

        // 2. Subscribe to matches to detect live status
        const unsubMatches = dataService.subscribeToMatches(id, (matches) => {
            const live = (matches || []).filter((m: any) => 
                m.status === MatchStatus.LIVE || 
                m.status === 'LIVE' || 
                m.status === 'IN_PROGRESS' ||
                m.status === 'STARTED'
            );
            setLiveMatches(live);
        });

        return () => {
            unsubTournament();
            unsubMatches();
        };
    }, [id]);

    const saveCameras = async (updated: CameraFeed[]) => {
        setCameras(updated);
        try {
            await dataService.updateTournament(id, {
                broadcastingSettings: {
                    ...(tournament?.broadcastingSettings || {}),
                    cameras: updated
                }
            });
        } catch (error) {
            console.error('[Broadcasting] Error saving cameras:', error);
        }
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
            // 1. Update tournament global setting
            await dataService.updateTournament(id, {
                broadcastingSettings: {
                    ...(tournament?.broadcastingSettings || {}),
                    globalAds: globalAds,
                    adUrl: adUrl
                }
            });

            // 2. Push to all matches in Supabase
            // We fetch current matches to iterate or use a massive update if the service allowed it
            const allMatches = await dataService.getMatches(id);
            for (const match of allMatches) {
                await dataService.updateMatch(id, match.id, {
                    forcedAds: globalAds,
                    current_ad_url: adUrl || null
                });
            }
        } catch (error) {
            console.error('[Broadcasting] Error pushing ads:', error);
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
                <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-4 border-b border-white/[0.04] bg-black/20">
                    <div className="flex items-center gap-4">
                        <BackButton href={`/tournaments/${id}/control`} className="rounded-2xl" />
                        <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
                            <Radio className="w-6 h-6 text-orange-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter leading-none mb-1">Broadcasting Center</h1>
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1.5 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                    Master Relay
                                </span>
                                <div className="h-3 w-px bg-white/10" />
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-white/20">
                                        <Cpu className="w-2.5 h-2.5" />
                                        12%
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-white/20">
                                        <Network className="w-2.5 h-2.5" />
                                        8.4MB/S
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] font-mono text-padel-primary/40">
                                        <Clock className="w-2.5 h-2.5" />
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className="flex items-center gap-3">
                        {/* Columns selector */}
                        <div className="hidden lg:flex items-center gap-1.5 p-1.5 bg-black/40 rounded-2xl border border-white/[0.05]">
                            <LayoutGrid className="w-3.5 h-3.5 text-gray-600 ml-2 mr-1" />
                            {([2, 3, 4] as const).map(n => (
                                <button
                                    key={n}
                                    onClick={() => setColumns(n)}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${columns === n ? 'bg-white/10 text-white shadow-lg' : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    {n}x{n}
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-10 bg-white/5 mx-2 hidden lg:block" />

                        <div className="flex items-center gap-3">
                            {/* Add camera */}
                            <button
                                onClick={addCamera}
                                className="flex items-center gap-2.5 px-5 py-3 bg-padel-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir Source
                            </button>

                            <Link
                                href={`/display/tv/1`}
                                target="_blank"
                                className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-gray-400 hover:text-white hover:border-white/20 transition-all"
                                title="Pizarra TV"
                            >
                                <Monitor className="w-5 h-5" />
                            </Link>

                            <Link
                                href={`/admin/publicidad`}
                                target="_blank"
                                className="w-12 h-12 flex items-center justify-center bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-yellow-400 hover:bg-yellow-500/20 transition-all"
                                title="ADS Manager"
                            >
                                <Tv className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </header>

                {/* ── ADS CONTROL CONSOLE ────────────────────────────────── */}
                <div className="flex-shrink-0 px-4 lg:px-6 py-4 border-b border-white/[0.04] bg-[#0c0c10]">
                    <div className="bg-black/40 border border-white/[0.04] rounded-2xl p-4 flex flex-col md:flex-row items-center gap-6">
                        <div className="flex items-center gap-4 border-r border-white/5 pr-6">
                            <div className={`p-2.5 rounded-xl transition-all ${globalAds ? 'bg-yellow-500/20 text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-white/5 text-gray-700'}`}>
                                <Megaphone className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Master ADS Control</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${globalAds ? 'bg-yellow-500 animate-pulse shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-gray-800'}`} />
                                    <span className={`text-[8px] font-bold uppercase tracking-widest ${globalAds ? 'text-yellow-500/80' : 'text-gray-600'}`}>
                                        {globalAds ? 'System Broadcasting Ads' : 'System Standby'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center gap-4 w-full">
                            <div className="flex-1 relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                    <Globe className="w-4 h-4 text-gray-700 group-focus-within:text-yellow-500/50 transition-colors" />
                                </div>
                                <input
                                    type="url"
                                    value={adUrl}
                                    onChange={e => setAdUrl(e.target.value)}
                                    placeholder="Source URL (Video, Image, YouTube, etc.)"
                                    className="w-full bg-black/60 border border-white/[0.06] rounded-xl pl-11 pr-4 py-3 text-[11px] text-white font-mono outline-none focus:border-yellow-500/30 transition-all placeholder:text-gray-800"
                                />
                            </div>

                            {/* Ad Preview Thumbnail */}
                            <div className="hidden lg:block w-24 aspect-video rounded-lg overflow-hidden border border-white/5 bg-black relative group/preview">
                                {adUrl ? (
                                    adUrl.includes('youtube') || adUrl.includes('embed') ? (
                                        <iframe src={adUrl} className="w-full h-full scale-150 origin-center pointer-events-none opacity-40 group-hover/preview:opacity-100 transition-opacity" />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={adUrl} alt="Ad Preview" className="w-full h-full object-cover opacity-40 group-hover/preview:opacity-100 transition-opacity" />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <EyeOff className="w-3 h-3 text-white/10" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setGlobalAds(v => !v)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${globalAds
                                        ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg shadow-yellow-500/20'
                                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-yellow-500/30 hover:text-yellow-500'
                                        }`}
                                >
                                    {globalAds ? <Zap className="w-4 h-4 fill-current" /> : <Square className="w-4 h-4" />}
                                    {globalAds ? 'ON AIR' : 'STANDBY'}
                                </button>

                                <button
                                    onClick={saveGlobalAds}
                                    disabled={savingAds || !canOperate}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all disabled:opacity-40"
                                >
                                    {savingAds ? <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" /> : <Save className="w-4 h-4" />}
                                    Push to Production
                                </button>
                            </div>
                        </div>
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
                        <span className="text-[7px] font-black uppercase text-gray-700 tracking-widest">Supabase Sync</span>
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
                @keyframes dash {
                    to { stroke-dashoffset: -100; }
                }
                path {
                    stroke-dasharray: 20;
                }
            `}</style>
        </div>
    );
}
