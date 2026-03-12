'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tv,
    Megaphone,
    Save,
    Plus,
    Trash2,
    ChevronLeft,
    CheckCircle2,
    Video,
    Clock,
    Upload,
    Loader2,
    Play,
    Eye,
    Maximize2,
    Palette,
    Layout,
    Zap,
    Sparkles,
    Radio,
    X,
    Camera,
    Youtube,
    Settings,
    Volume2,
    VolumeX,
    Monitor,
    Wifi
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { rtdb } from '@/lib/rtdb';
import { ref as rtdbRef, set as rtdbSet, onValue, off } from 'firebase/database';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { MediaContent } from '@/lib/supabase/publicidad';

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdsManagement({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);

    // ── Active tab: 'ads' | 'broadcast' | 'youtube'
    const [activeTab, setActiveTab] = useState<'ads' | 'broadcast' | 'youtube'>('ads');

    // ── YOUTUBE / CAMERAS state
    interface CameraFeed { id: string; label: string; url: string; type: 'youtube' | 'rtmp' | 'image' | 'hls' | 'iframe'; courtId?: number; active: boolean; }
    const DEFAULT_CAMERAS: CameraFeed[] = [
        { id: 'cam_1', label: 'Pista 1', url: '', type: 'iframe', courtId: 1, active: true },
        { id: 'cam_2', label: 'Pista 2', url: '', type: 'iframe', courtId: 2, active: true },
        { id: 'cam_3', label: 'Pista 3', url: '', type: 'iframe', courtId: 3, active: true },
        { id: 'cam_4', label: 'Pista 4', url: '', type: 'iframe', courtId: 4, active: true },
        { id: 'cam_5', label: 'Pista 5', url: '', type: 'iframe', courtId: 5, active: true },
        { id: 'cam_6', label: 'Pista 6', url: '', type: 'iframe', courtId: 6, active: true },
    ];
    const extractYouTubeId = (url: string) => {
        const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
        return m ? m[1] : null;
    };
    const [cameras, setCameras] = useState<CameraFeed[]>(DEFAULT_CAMERAS);
    const [editingCamIdx, setEditingCamIdx] = useState<number | null>(null);
    const [fullscreenCam, setFullscreenCam] = useState<string | null>(null);
    const [camColumns, setCamColumns] = useState<2 | 3>(2);
    const [mutedCams, setMutedCams] = useState<Record<string, boolean>>({});
    const [savingCameras, setSavingCameras] = useState(false);

    // ── ADS state
    const [adFrequency, setAdFrequency] = useState(60);
    const [adDuration, setAdDuration] = useState(10);
    const [adMediaUrls, setAdMediaUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState<string | null>(null);
    const [previewIdx, setPreviewIdx] = useState<number | null>(null);

    // ── BROADCAST state
    const [primaryColor, setPrimaryColor] = useState('#ccff00');
    const [bannerText, setBannerText] = useState('');
    const [showLiveIndicator, setShowLiveIndicator] = useState(true);
    const [sponsors, setSponsors] = useState<{ name: string; logoUrl?: string }[]>([]);
    const [funAnimations, setFunAnimations] = useState(true);
    const [aiSearch, setAiSearch] = useState(false);
    const [showTicker, setShowTicker] = useState(true);
    const [venueName, setVenueName] = useState('');
    const [clockStyle, setClockStyle] = useState<'classic' | 'broadcast'>('classic');
    const [clockImageUrl, setClockImageUrl] = useState<string>('');

    const SAMPLE_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-man-playing-padel-tennis-41484-large.mp4";

    // ── CARRUSEL state (RTDB: publicidad_master/imagenes)
    interface CarouselImage { id: string; url: string; orden: number; activa: boolean; }
    const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
    const [carouselInterval, setCarouselInterval] = useState(8);
    const [uploadingCarousel, setUploadingCarousel] = useState<string | null>(null);
    const [savingCarousel, setSavingCarousel] = useState(false);
    const [libraryImages, setLibraryImages] = useState<MediaContent[]>([]);
    const [selectedLibraryImageId, setSelectedLibraryImageId] = useState<string>('');

    // ── Supabase client para reutilizar biblioteca de medios (imágenes) ───────
    const supabase = useMemo(() => {
        try {
            if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                return createClient();
            }
        } catch {
            // env incompleto o cliente inválido: ignorar en entorno local
        }
        return null;
    }, []);

    // ── Auth guard
    useEffect(() => {
        if (!authLoading && !isAdmin) router.push('/');
    }, [isAdmin, authLoading, router]);

    // ── Firestore listener
    useEffect(() => {
        if (!id || authLoading || !isAdmin) return;
        const docRef = doc(db, 'tournaments', id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTournament({ id: docSnap.id, ...data });
                const bs = data.broadcastingSettings || {};
                // ADS
                setAdFrequency(bs.adFrequencySeconds || 60);
                setAdDuration(bs.adDurationSeconds || 10);
                setAdMediaUrls(bs.adMediaUrls || []);
                // BROADCAST
                setPrimaryColor(bs.primaryColor || '#ccff00');
                setBannerText(bs.bannerText || '');
                setShowLiveIndicator(bs.showLiveIndicator !== false);
                setSponsors(bs.sponsors || []);
                setFunAnimations(bs.funAnimationsEnabled !== false);
                setAiSearch(bs.aiAnimationSearchEnabled || false);
                setShowTicker(bs.showTicker !== false);
                setVenueName(bs.venueName || '');
                setClockStyle(bs.clockStyle || 'classic');
                setClockImageUrl(bs.clockImageUrl || '');
                // CAMERAS
                if (bs.cameras) setCameras(bs.cameras);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [id, authLoading, isAdmin]);

    // ── Cargar imágenes de biblioteca de Supabase (media_content.tipo = 'imagen') ──
    useEffect(() => {
        const loadLibraryImages = async () => {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('media_content')
                .select('*')
                .eq('tipo', 'imagen')
                .order('created_at', { ascending: false });
            if (!error && data) {
                setLibraryImages(data as MediaContent[]);
            }
        };
        void loadLibraryImages();
    }, [supabase]);

    // ── Cargar carrusel desde RTDB
    useEffect(() => {
        if (!rtdb) return;
        const carouselRef = rtdbRef(rtdb, 'publicidad_master');
        const handler = (snap: any) => {
            const val = snap.val();
            if (val?.imagenes) {
                const imgs = Object.entries(val.imagenes as Record<string, any>)
                    .map(([key, img]: [string, any]) => ({ id: key, url: img.url || '', orden: img.orden ?? 0, activa: img.activa ?? true }))
                    .sort((a, b) => a.orden - b.orden);
                setCarouselImages(imgs);
            }
            if (val?.carrusel_intervalo_seg) setCarouselInterval(val.carrusel_intervalo_seg);
        };
        onValue(carouselRef, handler);
        return () => off(carouselRef, 'value', handler);
    }, []);

    // ── File upload helper
    const handleFileUpload = async (file: File, type: 'ad' | 'sponsor', index: number) => {
        const key = `${type}-${index}`;
        setUploading(key);
        try {
            const fileRef = ref(storage, `tournaments/${id}/${type}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            if (type === 'ad') {
                const newUrls = [...adMediaUrls];
                newUrls[index] = url;
                setAdMediaUrls(newUrls);
            } else {
                updateSponsor(index, 'logoUrl', url);
            }
        } catch (error) { console.error(error); alert('Error al subir el archivo'); }
        finally { setUploading(null); }
    };

    // ── Sponsor helpers
    const addSponsor = () => setSponsors([...sponsors, { name: '', logoUrl: '' }]);
    const removeSponsor = (i: number) => setSponsors(sponsors.filter((_, idx) => idx !== i));
    const updateSponsor = (i: number, field: string, value: string) => {
        const s = [...sponsors];
        s[i] = { ...s[i], [field]: value };
        setSponsors(s);
    };

    // ── Ad helpers
    const addAd = () => setAdMediaUrls([...adMediaUrls, '']);
    const removeAd = (i: number) => setAdMediaUrls(adMediaUrls.filter((_, idx) => idx !== i));

    // ── Carrusel helpers
    const handleCarouselUpload = async (file: File, imgId?: string) => {
        const key = imgId || `new_${Date.now()}`;
        setUploadingCarousel(key);
        try {
            const fileRef = ref(storage, `tournaments/carousel/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);
            if (imgId) {
                // Actualizar imagen existente
                setCarouselImages(prev => prev.map(img => img.id === imgId ? { ...img, url } : img));
            } else {
                // Agregar nueva
                const newImg: CarouselImage = { id: key, url, orden: carouselImages.length, activa: true };
                setCarouselImages(prev => [...prev, newImg]);
            }
        } catch (e) { console.error(e); alert('Error al subir imagen'); }
        finally { setUploadingCarousel(null); }
    };

    const saveCarousel = async () => {
        if (!rtdb) {
            console.error("[Ads] RTDB not initialized");
            return;
        }
        setSavingCarousel(true);
        try {
            const imagesObj: Record<string, any> = {};
            carouselImages.forEach((img, i) => {
                imagesObj[img.id] = { url: img.url, orden: i, activa: img.activa };
            });
            await rtdbSet(rtdbRef(rtdb, 'publicidad_master/imagenes'), imagesObj);
            await rtdbSet(rtdbRef(rtdb, 'publicidad_master/carrusel_intervalo_seg'), carouselInterval);
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 2000);
        } catch (e) { console.error(e); }
        finally { setSavingCarousel(false); }
    };

    const removeCarouselImage = (imgId: string) => {
        setCarouselImages(prev => prev.filter(img => img.id !== imgId));
    };

    const addCarouselFromLibrary = () => {
        if (!selectedLibraryImageId) return;
        const media = libraryImages.find(m => m.id === selectedLibraryImageId);
        if (!media) return;
        const newImg: CarouselImage = {
            id: `lib_${media.id}_${Date.now()}`,
            url: media.url,
            orden: carouselImages.length,
            activa: true,
        };
        setCarouselImages(prev => [...prev, newImg]);
        setSelectedLibraryImageId('');
    };

    // ── Save
    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'tournaments', id), {
                broadcastingSettings: {
                    // ADS
                    adFrequencySeconds: adFrequency,
                    adDurationSeconds: adDuration,
                    adMediaUrls: adMediaUrls.length > 0 ? adMediaUrls : [SAMPLE_VIDEO],
                    // BROADCAST
                    primaryColor,
                    bannerText,
                    showLiveIndicator,
                    sponsors,
                    funAnimationsEnabled: funAnimations,
                    aiAnimationSearchEnabled: aiSearch,
                    showTicker,
                    venueName,
                    clockStyle,
                    clockImageUrl,
                    // CAMERAS
                    cameras,
                }
            });
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        } catch (error) { console.error(error); alert('Error al guardar'); }
        finally { setSaving(false); }
    };

    // ── Save cameras only (quick save)
    const handleSaveCameras = async () => {
        setSavingCameras(true);
        try {
            await updateDoc(doc(db, 'tournaments', id), {
                'broadcastingSettings.cameras': cameras,
                updatedAt: new Date(),
            });
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 2000);
        } catch (error) { console.error(error); }
        finally { setSavingCameras(false); }
    };

    const updateCamera = (idx: number, partial: Partial<{ label: string; url: string; type: string; courtId?: number }>) => {
        setCameras(prev => prev.map((c, i) => i === idx ? { ...c, ...partial } as typeof c : c));
    };

    const addCamera = () => {
        setCameras(prev => [...prev, { id: `cam_${Date.now()}`, label: `Pista ${prev.length + 1}`, url: '', type: 'iframe', active: true }]);
    };

    const removeCamera = (idx: number) => {
        setCameras(prev => prev.filter((_, i) => i !== idx));
    };

    // ── Loading
    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 pl-28">
            <Loader2 className="w-12 h-12 text-padel-primary animate-spin" />
            <p className="text-padel-primary font-black italic uppercase tracking-widest text-xs">Cargando...</p>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-outfit">
            <Sidebar />

            <div className="flex-1 flex flex-col p-8 pl-32 max-w-7xl mx-auto w-full gap-6 relative pb-24">

                {/* ── Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link
                            href={`/tournaments/${id}/control`}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                        >
                            <ChevronLeft className="w-6 h-6 text-gray-400 group-hover:text-white" />
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-4">
                                <Megaphone className="w-10 h-10 text-padel-primary" />
                                Publicidad &amp; <span className="text-padel-primary">Transmisión</span>
                            </h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                                {tournament?.name} · Gestión de anuncios y configuración OBS
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 bg-padel-primary text-black px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(204,255,0,0.2)] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar Todo'}
                    </button>
                </div>

                {/* ── Internal Tabs */}
                <div className="flex gap-2 p-1 bg-white/[0.03] rounded-2xl border border-white/5 self-start">
                    {([
                        { key: 'ads', label: 'Publicidad', icon: <Video className="w-4 h-4" /> },
                        { key: 'broadcast', label: 'Transmisión', icon: <Tv className="w-4 h-4" /> },
                        { key: 'youtube', label: 'YouTube / Cámaras', icon: <Youtube className="w-4 h-4" /> },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.key
                                ? 'bg-padel-primary text-black shadow-[0_4px_20px_rgba(204,255,0,0.25)]'
                                : 'text-gray-500 hover:text-white'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB CONTENT */}
                <AnimatePresence mode="wait">

                    {/* ══════════════ ADS TAB ══════════════ */}
                    {activeTab === 'ads' && (
                        <motion.div
                            key="ads"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="grid grid-cols-12 gap-8"
                        >
                            {/* Left: timing config */}
                            <div className="col-span-12 lg:col-span-4 space-y-6">
                                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-8 backdrop-blur-md">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-6 h-6 text-padel-primary" />
                                        <h2 className="text-lg font-black italic uppercase tracking-tight">Tiempos y Frecuencia</h2>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Frecuencia (segundos)</label>
                                                <span className="text-xl font-black italic text-padel-primary">{adFrequency}s</span>
                                            </div>
                                            <input type="range" min="30" max="300" step="10" value={adFrequency}
                                                onChange={(e) => setAdFrequency(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-padel-primary" />
                                            <p className="text-[9px] text-gray-600 font-bold leading-relaxed italic">Cada cuánto tiempo se mostrará un anuncio en la pantalla principal.</p>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-end">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Duración (segundos)</label>
                                                <span className="text-xl font-black italic text-padel-primary">{adDuration}s</span>
                                            </div>
                                            <input type="range" min="5" max="60" step="5" value={adDuration}
                                                onChange={(e) => setAdDuration(parseInt(e.target.value))}
                                                className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-padel-primary" />
                                            <p className="text-[9px] text-gray-600 font-bold leading-relaxed italic">Cuánto tiempo permanecerá visible cada anuncio antes de volver al marcador.</p>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-[#fb923c]/5 border border-[#fb923c]/20 rounded-[2.5rem] p-8 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Eye className="w-6 h-6 text-[#fb923c]" />
                                        <h2 className="text-lg font-black italic uppercase tracking-tight text-[#fb923c]">Placeholder</h2>
                                    </div>
                                    <p className="text-xs font-bold text-[#fb923c]/80 leading-relaxed italic">
                                        Si no hay anuncios cargados, el sistema mostrará automáticamente un mensaje de "Espacio Reservado" invitando a nuevos patrocinadores.
                                    </p>
                                </section>
                            </div>

                            {/* Right: media gallery */}
                            <div className="col-span-12 lg:col-span-8">
                                <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-3">
                                            <Video className="w-6 h-6 text-padel-primary" />
                                            <h2 className="text-lg font-black italic uppercase tracking-tight">Galería de Anuncios</h2>
                                        </div>
                                        <button onClick={addAd} className="p-3 bg-padel-primary text-black rounded-2xl hover:scale-110 transition-all shadow-[0_10px_20px_rgba(204,255,0,0.2)]">
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {adMediaUrls.length === 0 && (
                                            <div className="col-span-2 py-20 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 opacity-30">
                                                <div className="p-5 bg-white/5 rounded-full"><Video className="w-10 h-10" /></div>
                                                <p className="text-xs font-black uppercase tracking-[0.2em] italic">No hay anuncios registrados</p>
                                            </div>
                                        )}
                                        {adMediaUrls.map((url, idx) => (
                                            <div key={idx} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden aspect-video transition-all hover:border-padel-primary/40">
                                                {url ? (
                                                    url.toLowerCase().endsWith('.mp4')
                                                        ? <video src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                        : <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                                                            <Upload className="w-6 h-6 text-gray-600" />
                                                        </div>
                                                        <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Subir Imagen o Video</p>
                                                    </div>
                                                )}

                                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 flex items-center justify-between translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                    <div className="flex gap-2">
                                                        <label className="p-3 bg-white text-black rounded-xl cursor-pointer hover:scale-105 transition-all">
                                                            <Upload className="w-4 h-4" />
                                                            <input type="file" className="hidden" accept="image/*,video/*"
                                                                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ad', idx)} />
                                                        </label>
                                                        {url && (
                                                            <button onClick={() => setPreviewIdx(idx)} className="p-3 bg-padel-primary text-black rounded-xl hover:scale-105 transition-all">
                                                                <Maximize2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <button onClick={() => removeAd(idx)} className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 transition-all hover:text-white">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {uploading === `ad-${idx}` && (
                                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                                                        <Loader2 className="w-8 h-8 text-padel-primary animate-spin" />
                                                        <span className="text-[10px] font-black text-padel-primary uppercase italic tracking-widest">Subiendo...</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* ── CARRUSEL section */}
                            <div className="col-span-12">
                                <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 backdrop-blur-md space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Layout className="w-6 h-6 text-padel-primary" />
                                            <h2 className="text-lg font-black italic uppercase tracking-tight">Carrusel de Imágenes</h2>
                                            <span className="text-xs font-bold text-gray-600 tracking-widest">({carouselImages.length} imágenes)</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Intervalo slider */}
                                            <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.04] rounded-xl border border-white/5">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-xs font-bold text-gray-400 tracking-widest">Intervalo:</span>
                                                <input type="range" min="3" max="30" step="1" value={carouselInterval}
                                                    onChange={e => setCarouselInterval(parseInt(e.target.value))}
                                                    className="w-24 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-padel-primary" />
                                                <span className="text-padel-primary font-black italic text-sm w-8">{carouselInterval}s</span>
                                            </div>
                                            {/* Subir nueva imagen desde archivo */}
                                            <label className="flex items-center gap-2 px-4 py-2.5 bg-padel-primary text-black rounded-xl font-black italic uppercase tracking-widest text-xs cursor-pointer hover:scale-105 transition-all">
                                                <Plus className="w-4 h-4" />
                                                Subir Imagen
                                                <input type="file" className="hidden" accept="image/*"
                                                    onChange={e => e.target.files?.[0] && handleCarouselUpload(e.target.files[0])} />
                                            </label>
                                            {/* Elegir desde biblioteca Supabase */}
                                            {libraryImages.length > 0 && (
                                                <div className="flex items-center gap-2 bg-white/[0.02] border border-white/10 rounded-xl px-3 py-2">
                                                    <select
                                                        className="bg-transparent text-xs font-bold uppercase tracking-widest text-gray-400 outline-none"
                                                        value={selectedLibraryImageId}
                                                        onChange={e => setSelectedLibraryImageId(e.target.value)}
                                                    >
                                                        <option value="">Biblioteca de imágenes</option>
                                                        {libraryImages.map(img => (
                                                            <option key={img.id} value={img.id}>
                                                                {img.nombre_sponsor || img.nombre || img.url}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={addCarouselFromLibrary}
                                                        disabled={!selectedLibraryImageId}
                                                        className="px-3 py-1.5 bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-white/20 disabled:opacity-40"
                                                    >
                                                        Añadir
                                                    </button>
                                                </div>
                                            )}
                                            {/* Guardar carrusel */}
                                            <button onClick={saveCarousel} disabled={savingCarousel}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-black italic uppercase tracking-widest text-xs hover:bg-white/10 transition-all disabled:opacity-50">
                                                {savingCarousel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                Guardar
                                            </button>
                                        </div>
                                    </div>

                                    {/* Grid de imágenes */}
                                    {carouselImages.length === 0 ? (
                                        <div className="py-16 border-2 border-dashed border-white/[0.06] rounded-[2rem] flex flex-col items-center justify-center gap-4 opacity-40">
                                            <Layout className="w-10 h-10" />
                                            <p className="text-xs font-black uppercase tracking-[0.2em] italic">Sin imágenes en el carrusel</p>
                                            <p className="text-[10px] text-gray-600">Sube imágenes para que aparezcan en la pizarra junto al marcador</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {carouselImages.map((img, idx) => (
                                                <div key={img.id} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] overflow-hidden aspect-video hover:border-padel-primary/40 transition-all">
                                                    {img.url ? (
                                                        <img src={img.url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 text-padel-primary animate-spin" />
                                                        </div>
                                                    )}
                                                    {/* Orden badge */}
                                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 rounded-lg text-[9px] font-black text-gray-400">#{idx + 1}</div>
                                                    {/* Toggle activa */}
                                                    <button
                                                        onClick={() => setCarouselImages(prev => prev.map(i => i.id === img.id ? { ...i, activa: !i.activa } : i))}
                                                        className={`absolute top-2 right-2 px-2 py-0.5 rounded-lg text-[9px] font-black transition-all ${img.activa ? 'bg-padel-primary text-black' : 'bg-white/10 text-gray-500'
                                                            }`}>
                                                        {img.activa ? 'ON' : 'OFF'}
                                                    </button>
                                                    {/* Overlay de acciones */}
                                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-3 flex items-center justify-between translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                        <label className="p-2 bg-white text-black rounded-lg cursor-pointer hover:scale-105 transition-all">
                                                            <Upload className="w-3.5 h-3.5" />
                                                            <input type="file" className="hidden" accept="image/*"
                                                                onChange={e => e.target.files?.[0] && handleCarouselUpload(e.target.files[0], img.id)} />
                                                        </label>
                                                        <button onClick={() => removeCarouselImage(img.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                    {uploadingCarousel === img.id && (
                                                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 text-padel-primary animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {/* ══════════════ BROADCAST TAB ══════════════ */}
                    {activeTab === 'broadcast' && (
                        <motion.div
                            key="broadcast"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="grid grid-cols-12 gap-8"
                        >
                            {/* Left: settings */}
                            <div className="col-span-12 lg:col-span-7 space-y-8">

                                {/* Identidad Visual */}
                                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Palette className="w-5 h-5 text-padel-primary" />
                                        <h2 className="text-sm font-black italic uppercase tracking-widest">Identidad Visual</h2>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Color Principal (Neon)</label>
                                            <div className="flex items-center gap-4">
                                                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                                                    className="w-12 h-12 bg-transparent border-0 rounded-xl cursor-pointer" />
                                                <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono uppercase" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Indicador "LIVE"</label>
                                            <button onClick={() => setShowLiveIndicator(!showLiveIndicator)}
                                                className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between ${showLiveIndicator ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                <span className="text-[10px] font-black uppercase">Mostrar Rec de OBS</span>
                                                <div className={`w-3 h-3 rounded-full ${showLiveIndicator ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-4">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Texto del Banner</label>
                                        <textarea placeholder="Ej: ¡Bienvenidos al Torneo de Verano!" value={bannerText}
                                            onChange={(e) => setBannerText(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-padel-primary transition-all outline-none resize-none h-20" />
                                    </div>
                                </section>

                                {/* Estilo de Reloj */}
                                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-padel-primary" />
                                            <h2 className="text-sm font-black italic uppercase tracking-widest">Estilo de Reloj</h2>
                                        </div>
                                        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                                            <button onClick={() => setClockStyle('classic')}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${clockStyle === 'classic' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}>Clásico</button>
                                            <button onClick={() => setClockStyle('broadcast')}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${clockStyle === 'broadcast' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}>Broadcast</button>
                                        </div>
                                    </div>

                                    {clockStyle === 'broadcast' && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.01] text-center space-y-4">
                                                {clockImageUrl ? (
                                                    <div className="relative group mx-auto w-48 aspect-video rounded-2xl overflow-hidden border border-white/10">
                                                        <img src={clockImageUrl} className="w-full h-full object-cover" />
                                                        <button onClick={() => setClockImageUrl('')}
                                                            className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-4 h-4 text-white" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-padel-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                                                            <Upload className="w-6 h-6 text-padel-primary" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-bold text-white">Imagen de Fondo (Reloj)</p>
                                                            <p className="text-[10px] text-gray-500">Recomendado: Branded o PNG Transparente</p>
                                                        </div>
                                                        <label className="inline-block px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all">
                                                            Subir Imagen
                                                            <input type="file" className="hidden" accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    setUploading('clock-bg');
                                                                    try {
                                                                        const fileRef = ref(storage, `tournaments/${id}/broadcast/clock_${Date.now()}_${file.name}`);
                                                                        await uploadBytes(fileRef, file);
                                                                        setClockImageUrl(await getDownloadURL(fileRef));
                                                                    } catch (err) { console.error(err); }
                                                                    finally { setUploading(null); }
                                                                }} />
                                                        </label>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                                        <div className="flex gap-3">
                                            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                            <p className="text-[10px] text-cyan-300/80 leading-relaxed font-medium">
                                                El estilo <span className="text-cyan-400 font-black">Broadcast</span> integra el reloj de forma más elegante sobre el tablero de mandos, permitiendo usar una imagen de marca o textura de fondo.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Marquesina */}
                                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Megaphone className="w-5 h-5 text-padel-primary" />
                                            <h2 className="text-sm font-black italic uppercase tracking-widest">Marquesina / Correa</h2>
                                        </div>
                                        <button onClick={() => setShowTicker(!showTicker)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${showTicker ? 'bg-padel-primary/10 border-padel-primary/30 text-padel-primary' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${showTicker ? 'bg-padel-primary animate-pulse' : 'bg-gray-700'}`} />
                                            {showTicker ? 'Visible' : 'Oculta'}
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nombre del Venue / Club</label>
                                        <input type="text" placeholder="Ej: Margarita Padel Center" value={venueName}
                                            onChange={(e) => setVenueName(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-sm focus:border-padel-primary transition-all outline-none" />
                                    </div>

                                    {/* Ticker preview */}
                                    <div className={`overflow-hidden rounded-2xl border transition-all ${showTicker ? 'border-padel-primary/20 bg-black' : 'border-white/5 bg-white/[0.02] opacity-40'}`}>
                                        <div className="flex items-center gap-8 whitespace-nowrap px-6 py-3 animate-marquee" style={{ fontSize: '11px' }}>
                                            <span className="font-black italic uppercase tracking-tighter text-white opacity-30">SMART PADEL PRO SYSTEM</span>
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                                            <span className="font-black italic uppercase tracking-tighter" style={{ color: primaryColor }}>
                                                {bannerText || 'BIENVENIDOS AL MEJOR PADEL DEL MUNDO'}
                                            </span>
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                                        </div>
                                    </div>
                                </section>

                                {/* Patrocinadores */}
                                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Megaphone className="w-5 h-5 text-padel-primary" />
                                            <h2 className="text-sm font-black italic uppercase tracking-widest">Patrocinadores Principales</h2>
                                        </div>
                                        <button onClick={addSponsor} className="p-2 bg-padel-primary/10 text-padel-primary rounded-xl hover:bg-padel-primary/20 transition-all">
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {sponsors.length === 0 ? (
                                            <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-gray-600">
                                                <Megaphone className="w-8 h-8 mb-4 opacity-20" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No hay patrocinadores registrados</p>
                                            </div>
                                        ) : sponsors.map((sponsor, idx) => (
                                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={idx}
                                                className="bg-white/5 rounded-[2rem] p-6 flex items-center gap-6 border border-white/5 group hover:border-white/10 transition-all">
                                                <div className="w-16 h-16 bg-black rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 relative overflow-hidden">
                                                    {sponsor.logoUrl ? <img src={sponsor.logoUrl} className="w-full h-full object-contain" /> : <Layout className="w-6 h-6 opacity-20" />}
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Nombre</label>
                                                        <input type="text" value={sponsor.name} onChange={(e) => updateSponsor(idx, 'name', e.target.value)}
                                                            placeholder="Ej: Gatorade"
                                                            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-padel-primary" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Logo (URL o Archivo)</label>
                                                        <div className="flex gap-2">
                                                            <input type="text" value={sponsor.logoUrl || ''} onChange={(e) => updateSponsor(idx, 'logoUrl', e.target.value)}
                                                                placeholder="https://..."
                                                                className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] outline-none focus:border-padel-primary" />
                                                            <label className="cursor-pointer flex items-center justify-center w-10 bg-white/5 border border-white/5 rounded-xl hover:bg-padel-primary/10 hover:border-padel-primary/30 transition-all">
                                                                <input type="file" className="hidden" accept="image/*"
                                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'sponsor', idx)} />
                                                                {uploading === `sponsor-${idx}` ? <Loader2 className="w-4 h-4 text-padel-primary animate-spin" /> : <Upload className="w-4 h-4 text-gray-500" />}
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={() => removeSponsor(idx)} className="p-3 text-red-500/30 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>

                                {/* Display Mode */}
                                <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Radio className="w-5 h-5 text-[#fb923c]" />
                                            <h2 className="text-sm font-black italic uppercase tracking-widest text-[#fb923c]">Configuración TV de Pista</h2>
                                        </div>
                                        <Zap className={`w-4 h-4 ${funAnimations ? 'text-amber-400' : 'text-gray-700'}`} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Efectos de Pizarra</label>
                                            <button onClick={() => setFunAnimations(!funAnimations)}
                                                className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between ${funAnimations ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                <span className="text-[10px] font-black uppercase">{funAnimations ? 'Animaciones ON' : 'Animaciones OFF'}</span>
                                                <div className={`w-3 h-3 rounded-full ${funAnimations ? 'bg-amber-400 animate-bounce' : 'bg-gray-700'}`} />
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                                                <Sparkles className="w-3 h-3 text-cyan-400" /> Búsqueda por IA
                                            </label>
                                            <button onClick={() => setAiSearch(!aiSearch)}
                                                className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between ${aiSearch ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                                                <span className="text-[10px] font-black uppercase">{aiSearch ? 'IA Activa' : 'Desactivada'}</span>
                                                <div className={`w-3 h-3 rounded-full ${aiSearch ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-gray-700'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* OBS Overlay link */}
                                    <div className="mt-2 pt-6 border-t border-white/5 space-y-3">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Link Overlay para OBS / YouTube</label>
                                        <div className="bg-black/40 border border-white/10 rounded-xl px-5 py-3 flex items-center gap-3">
                                            <Radio className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
                                            <code className="text-[10px] text-padel-primary font-mono flex-1 truncate">
                                                {typeof window !== 'undefined' ? `${window.location.origin}/tournaments/${id}/stream/{matchId}` : `/tournaments/${id}/stream/{matchId}`}
                                            </code>
                                        </div>
                                        <p className="text-[9px] text-gray-600 font-bold italic">Reemplaza {'{matchId}'} con el ID del partido activo. Añádelo como fuente "Navegador" en OBS.</p>
                                    </div>
                                </section>
                            </div>

                            {/* Right: Preview */}
                            <div className="col-span-12 lg:col-span-5">
                                <div className="sticky top-10 space-y-6">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden flex flex-col items-center">
                                        <div className="flex items-center gap-3 self-start mb-8">
                                            <Eye className="w-5 h-5 text-padel-primary" />
                                            <h2 className="text-sm font-black italic uppercase tracking-widest">Vista Previa Broadcast</h2>
                                        </div>

                                        <div className="w-full aspect-video bg-[#0a2f0a] rounded-[2rem] border-4 border-black shadow-2xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-20 grayscale" />

                                            {showLiveIndicator && (
                                                <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/40 rounded-full">
                                                    <span className="text-[6px] font-black uppercase tracking-tighter text-white">REC LIVE</span>
                                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                                </div>
                                            )}

                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-stretch">
                                                <div className="flex-[2] flex items-center px-4 border-r border-white/5">
                                                    <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }} />
                                                    <span className="text-[10px] font-black italic uppercase truncate">Team A vs Team B</span>
                                                </div>
                                                <div className="w-12 flex items-center justify-center font-black italic text-lg" style={{ color: primaryColor }}>30:15</div>
                                                <div className="flex-1 flex items-center justify-center bg-white/5 font-black text-[10px] italic">SET 1</div>
                                            </div>

                                            {sponsors.length > 0 && (
                                                <div className="absolute top-4 left-4 bg-white/5 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-2 border border-white/10">
                                                    <span className="text-[6px] font-black uppercase text-gray-500 italic">Sponsored by</span>
                                                    <div className="h-3 flex items-center gap-2">
                                                        <div className="h-full px-2 py-0.5 bg-padel-primary/20 rounded-sm text-[8px] font-black text-padel-primary uppercase italic tracking-tighter truncate max-w-[80px]">
                                                            {sponsors[0].name}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 text-center w-full">
                                            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                                                Los cambios se reflejan automáticamente en los overlays OBS de todos los partidos activos.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {/* ══════════════ YOUTUBE / CÁMARAS TAB ══════════════ */}
                    {activeTab === 'youtube' && (
                        <motion.div
                            key="youtube"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-6"
                        >
                            {/* Controls */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Youtube className="w-5 h-5 text-red-400" />
                                    <h2 className="text-lg font-black italic uppercase tracking-tight">
                                        Streams <span className="text-red-400">por Pista</span>
                                    </h2>
                                    <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                                        — Máx. 6 pistas (La Margarita)
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Column toggle */}
                                    <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                                        {([2, 3] as const).map(n => (
                                            <button
                                                key={n}
                                                onClick={() => setCamColumns(n)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${camColumns === n ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'
                                                    }`}
                                            >{n}</button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addCamera}
                                        className="flex items-center gap-2 px-3 py-2 bg-padel-primary/10 border border-padel-primary/20 rounded-xl text-padel-primary text-[9px] font-black uppercase tracking-widest hover:bg-padel-primary/20 transition-all"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Cámara
                                    </button>
                                    <button
                                        onClick={handleSaveCameras}
                                        disabled={savingCameras}
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-300 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-40"
                                    >
                                        {savingCameras ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                        Guardar
                                    </button>
                                </div>
                            </div>

                            {/* Camera grid */}
                            <div className={`grid gap-4 ${camColumns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                {cameras.map((cam, idx) => {
                                    const ytId = cam.type === 'youtube' ? extractYouTubeId(cam.url) : null;
                                    const hasStream = cam.url.trim() !== '';
                                    const isEditing = editingCamIdx === idx;
                                    const muted = mutedCams[cam.id] !== false; // default muted

                                    return (
                                        <div key={cam.id} className="flex flex-col bg-[#0c0c10] border border-white/[0.06] rounded-2xl overflow-hidden group">
                                            {/* Stream area */}
                                            <div className="aspect-video relative bg-black">
                                                {hasStream ? (
                                                    ytId ? (
                                                        <iframe
                                                            src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&modestbranding=1`}
                                                            className="absolute inset-0 w-full h-full border-0"
                                                            allow="autoplay; encrypted-media"
                                                            allowFullScreen
                                                        />
                                                    ) : cam.type === 'image' ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={cam.url} alt={cam.label} className="absolute inset-0 w-full h-full object-cover" />
                                                    ) : (
                                                        <iframe
                                                            src={cam.url}
                                                            className="absolute inset-0 w-full h-full border-0"
                                                            allowFullScreen
                                                        />
                                                    )
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                                                        <Camera className="w-8 h-8 text-white/10" />
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white/20">Sin señal</p>
                                                    </div>
                                                )}

                                                {/* LIVE badge */}
                                                <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 border border-white/10 rounded-lg backdrop-blur-sm">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${hasStream ? 'bg-red-500 animate-pulse shadow-[0_0_4px_red]' : 'bg-gray-700'}`} />
                                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/60">{cam.label}</span>
                                                </div>

                                                {/* Controls overlay */}
                                                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {hasStream && (
                                                        <button
                                                            onClick={() => setMutedCams(prev => ({ ...prev, [cam.id]: !muted }))}
                                                            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
                                                        >
                                                            {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setEditingCamIdx(isEditing ? null : idx)}
                                                        className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 text-white/60 hover:text-white transition-all"
                                                    >
                                                        <Settings className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Edit row */}
                                            <AnimatePresence>
                                                {isEditing && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-3 space-y-2 border-t border-white/[0.05] bg-black/30">
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={cam.label}
                                                                    onChange={e => updateCamera(idx, { label: e.target.value })}
                                                                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none focus:border-padel-primary/40"
                                                                    placeholder="Nombre"
                                                                />
                                                                <select
                                                                    value={cam.type}
                                                                    onChange={e => updateCamera(idx, { type: e.target.value as any })}
                                                                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white outline-none"
                                                                >
                                                                    {['youtube', 'iframe', 'image', 'hls'].map(t => <option key={t} value={t}>{t}</option>)}
                                                                </select>
                                                                <button
                                                                    onClick={() => removeCamera(idx)}
                                                                    className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="url"
                                                                value={cam.url}
                                                                onChange={e => updateCamera(idx, { url: e.target.value })}
                                                                className="w-full bg-black border border-white/10 rounded-lg px-3 py-1.5 text-[10px] text-white outline-none focus:border-padel-primary/40 font-mono"
                                                                placeholder={cam.type === 'youtube' ? 'https://youtu.be/...' : 'URL del stream...'}
                                                            />
                                                            {cam.type === 'youtube' && cam.url && extractYouTubeId(cam.url) && (
                                                                <p className="text-[7px] text-green-500 font-bold">✓ YouTube ID: {extractYouTubeId(cam.url)}</p>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })}

                                {/* Add camera placeholder */}
                                <button
                                    onClick={addCamera}
                                    className="aspect-video rounded-2xl border-2 border-dashed border-white/[0.06] flex flex-col items-center justify-center gap-2 hover:border-padel-primary/30 hover:bg-padel-primary/[0.02] transition-all group"
                                >
                                    <Plus className="w-6 h-6 text-white/20 group-hover:text-padel-primary/60 transition-colors" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-padel-primary/60 transition-colors">Añadir cámara</span>
                                </button>
                            </div>

                            {/* Status bar */}
                            <div className="flex items-center gap-4 px-4 py-2.5 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                <Wifi className="w-3 h-3 text-green-500" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-gray-700">Firebase Sync</span>
                                <span className="text-gray-800">·</span>
                                <span className="text-[8px] text-gray-700 font-bold">{cameras.filter(c => c.url).length} streams activos de {cameras.length}</span>
                                <span className="ml-auto text-[8px] font-black tracking-widest uppercase text-gray-800 italic">Padel Smart Pro · Broadcasting</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Saved Toast */}
            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] bg-padel-primary text-black px-10 py-5 rounded-full font-black italic uppercase text-xs tracking-widest shadow-[0_20px_50px_rgba(204,255,0,0.5)] border-4 border-black flex items-center gap-4"
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        Configuración Actualizada
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Media Preview Modal */}
            <AnimatePresence>
                {previewIdx !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewIdx(null)}
                        className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-8 backdrop-blur-xl"
                    >
                        <div className="relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-black">
                            {adMediaUrls[previewIdx].toLowerCase().endsWith('.mp4')
                                ? <video src={adMediaUrls[previewIdx]} controls autoPlay className="w-full h-full object-contain" />
                                : <img src={adMediaUrls[previewIdx]} className="w-full h-full object-contain p-12" />
                            }
                            <button
                                onClick={(e) => { e.stopPropagation(); setPreviewIdx(null); }}
                                className="absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all border border-white/10 backdrop-blur-md"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}
