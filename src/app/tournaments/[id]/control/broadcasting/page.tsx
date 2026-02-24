'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tv,
    Palette,
    Megaphone,
    Save,
    Plus,
    Trash2,
    ChevronLeft,
    CheckCircle2,
    Layout,
    Eye,
    Video,
    Zap,
    Sparkles,
    Clock,
    Upload,
    Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function BroadcastingSettings({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);

    // Form state
    const [primaryColor, setPrimaryColor] = useState('#ccff00');
    const [bannerText, setBannerText] = useState('');
    const [showLiveIndicator, setShowLiveIndicator] = useState(true);
    const [sponsors, setSponsors] = useState<{ name: string; logoUrl?: string }[]>([]);
    const [adFrequency, setAdFrequency] = useState(60);
    const [adDuration, setAdDuration] = useState(10);
    const [adMediaUrls, setAdMediaUrls] = useState<string[]>([]);
    const [funAnimations, setFunAnimations] = useState(true);
    const [aiSearch, setAiSearch] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [showTicker, setShowTicker] = useState(true);
    const [venueName, setVenueName] = useState('');

    const SAMPLE_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-man-playing-padel-tennis-41484-large.mp4";

    const handleFileUpload = async (file: File, type: 'sponsor' | 'ad', index: number) => {
        const uploadKey = `${type}-${index}`;
        setUploading(uploadKey);
        try {
            const fileRef = ref(storage, `tournaments/${id}/${type}/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            if (type === 'sponsor') {
                updateSponsor(index, 'logoUrl', url);
            } else {
                const newUrls = [...adMediaUrls];
                newUrls[index] = url;
                setAdMediaUrls(newUrls);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir el archivo');
        } finally {
            setUploading(null);
        }
    };

    useEffect(() => {
        if (!id || authLoading) return;

        const docRef = doc(db, 'tournaments', id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTournament({ id: docSnap.id, ...data });

                if (data.broadcastingSettings) {
                    setPrimaryColor(data.broadcastingSettings.primaryColor || '#ccff00');
                    setBannerText(data.broadcastingSettings.bannerText || '');
                    setShowLiveIndicator(data.broadcastingSettings.showLiveIndicator !== false);
                    setSponsors(data.broadcastingSettings.sponsors || []);
                    setAdFrequency(data.broadcastingSettings.adFrequencySeconds || 60);
                    setAdDuration(data.broadcastingSettings.adDurationSeconds || 10);
                    setAdMediaUrls(data.broadcastingSettings.adMediaUrls || [SAMPLE_VIDEO]);
                    setFunAnimations(data.broadcastingSettings.funAnimationsEnabled !== false);
                    setAiSearch(data.broadcastingSettings.aiAnimationSearchEnabled || false);
                    setShowTicker(data.broadcastingSettings.showTicker !== false);
                    setVenueName(data.broadcastingSettings.venueName || '');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, authLoading]);

    const addSponsor = () => {
        setSponsors([...sponsors, { name: '', logoUrl: '' }]);
    };

    const removeSponsor = (index: number) => {
        setSponsors(sponsors.filter((_, i) => i !== index));
    };

    const updateSponsor = (index: number, field: string, value: string) => {
        const newSponsors = [...sponsors];
        newSponsors[index] = { ...newSponsors[index], [field]: value };
        setSponsors(newSponsors);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDoc(doc(db, 'tournaments', id), {
                broadcastingSettings: {
                    primaryColor,
                    bannerText,
                    showLiveIndicator,
                    sponsors,
                    adFrequencySeconds: adFrequency,
                    adDurationSeconds: adDuration,
                    adMediaUrls: adMediaUrls.length > 0 ? adMediaUrls : [SAMPLE_VIDEO],
                    funAnimationsEnabled: funAnimations,
                    aiAnimationSearchEnabled: aiSearch,
                    showTicker,
                    venueName
                }
            });
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        }
        setSaving(false);
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-outfit">
            <Sidebar />

            <div className="flex-1 p-6 lg:p-10 pl-24 md:pl-32 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all text-gray-500 hover:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                                <Tv className="w-8 h-8 text-padel-primary" />
                                Configuración de <span className="text-padel-primary">Transmisión</span>
                            </h1>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.3em] mt-1">Módulo de Estilo y Patrocinadores</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 bg-padel-primary text-black px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-padel-primary/20 disabled:opacity-50"
                    >
                        {saving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Settings Form */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                        {/* Visual Styles */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Palette className="w-5 h-5 text-padel-primary" />
                                <h2 className="text-sm font-black italic uppercase tracking-widest">Identidad Visual</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Color Principal (Neon)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-12 h-12 bg-transparent border-0 rounded-xl cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono uppercase"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Indicador "LIVE"</label>
                                    <button
                                        onClick={() => setShowLiveIndicator(!showLiveIndicator)}
                                        className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between ${showLiveIndicator ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase">Mostrar Rec de OBS</span>
                                        <div className={`w-3 h-3 rounded-full ${showLiveIndicator ? 'bg-red-500 animate-pulse' : 'bg-gray-700'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Texto de la Marquesina (Banners)</label>
                                <textarea
                                    placeholder="Ej: ¡Bienvenidos al Torneo de Verano Margarita 2024! Patrocinado por..."
                                    value={bannerText}
                                    onChange={(e) => setBannerText(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-padel-primary transition-all outline-none resize-none h-24"
                                />
                            </div>
                        </section>

                        {/* Ticker / Marquesina */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Megaphone className="w-5 h-5 text-padel-primary" />
                                    <h2 className="text-sm font-black italic uppercase tracking-widest">Marquesina / Correa Informativa</h2>
                                </div>
                                <button
                                    onClick={() => setShowTicker(!showTicker)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${showTicker
                                            ? 'bg-padel-primary/10 border-padel-primary/30 text-padel-primary'
                                            : 'bg-white/5 border-white/10 text-gray-500'
                                        }`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full transition-colors ${showTicker ? 'bg-padel-primary animate-pulse' : 'bg-gray-700'}`} />
                                    {showTicker ? 'Visible' : 'Oculta'}
                                </button>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Nombre del Venue / Club</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Margarita Padel Center"
                                    value={venueName}
                                    onChange={(e) => setVenueName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-3 text-sm focus:border-padel-primary transition-all outline-none"
                                />
                                <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Aparece junto al indicador DIRECTO en la pizarra</p>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Texto de la Correa</label>
                                <textarea
                                    placeholder="Ej: ¡Bienvenidos al Torneo de Verano Margarita 2024! Patrocinado por..."
                                    value={bannerText}
                                    onChange={(e) => setBannerText(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:border-padel-primary transition-all outline-none resize-none h-20"
                                />
                            </div>

                            {/* Preview ticker */}
                            <div className={`overflow-hidden rounded-2xl border transition-all ${showTicker ? 'border-padel-primary/20 bg-black' : 'border-white/5 bg-white/[0.02] opacity-40'}`}>
                                <div className="flex items-center gap-8 whitespace-nowrap px-6 py-3 animate-marquee" style={{ fontSize: '11px' }}>
                                    <span className="font-black italic uppercase tracking-tighter text-white opacity-30">SMART PADEL PRO SYSTEM</span>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                                    <span className="font-black italic uppercase tracking-tighter" style={{ color: primaryColor }}>
                                        {bannerText || 'BIENVENIDOS AL MEJOR PADEL DEL MUNDO'}
                                    </span>
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                                    <span className="font-black italic uppercase tracking-tighter text-white opacity-30">SMART PADEL PRO SYSTEM</span>
                                </div>
                            </div>
                        </section>

                        {/* Sponsors Management */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Megaphone className="w-5 h-5 text-padel-primary" />
                                    <h2 className="text-sm font-black italic uppercase tracking-widest">Patrocinadores Principales</h2>
                                </div>
                                <button
                                    onClick={addSponsor}
                                    className="p-2 bg-padel-primary/10 text-padel-primary rounded-xl hover:bg-padel-primary/20 transition-all"
                                >
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
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key={idx}
                                        className="bg-white/5 rounded-[2rem] p-6 flex items-center gap-6 border border-white/5 group hover:border-white/10 transition-all"
                                    >
                                        <div className="w-16 h-16 bg-black rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 relative overflow-hidden">
                                            {sponsor.logoUrl ? (
                                                <img src={sponsor.logoUrl} className="w-full h-full object-contain" />
                                            ) : (
                                                <Layout className="w-6 h-6 opacity-20" />
                                            )}
                                        </div>
                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={sponsor.name}
                                                    onChange={(e) => updateSponsor(idx, 'name', e.target.value)}
                                                    placeholder="Ej: Gatorade"
                                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs outline-none focus:border-padel-primary"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[8px] font-black uppercase text-gray-600 tracking-widest ml-1">Logo (Archivo o URL)</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={sponsor.logoUrl || ''}
                                                        onChange={(e) => updateSponsor(idx, 'logoUrl', e.target.value)}
                                                        placeholder="https://..."
                                                        className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-[10px] outline-none focus:border-padel-primary"
                                                    />
                                                    <label className="cursor-pointer group flex items-center justify-center w-10 bg-white/5 border border-white/5 rounded-xl hover:bg-padel-primary/10 hover:border-padel-primary/30 transition-all">
                                                        <input
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'sponsor', idx)}
                                                        />
                                                        {uploading === `sponsor-${idx}` ? (
                                                            <Loader2 className="w-4 h-4 text-padel-primary animate-spin" />
                                                        ) : (
                                                            <Upload className="w-4 h-4 text-gray-500 group-hover:text-padel-primary" />
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeSponsor(idx)}
                                            className="p-3 text-red-500/30 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Display Mode Settings */}
                        <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Video className="w-5 h-5 text-padel-primary" />
                                    <h2 className="text-sm font-black italic uppercase tracking-widest text-[#fb923c]">Configuración TV de Pista</h2>
                                </div>
                                <Zap className={`w-4 h-4 ${funAnimations ? 'text-amber-400' : 'text-gray-700'}`} />
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Frecuencia (seg)
                                    </label>
                                    <input
                                        type="number"
                                        value={adFrequency}
                                        onChange={(e) => setAdFrequency(parseInt(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-padel-primary outline-none"
                                        placeholder="60"
                                    />
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Tiempo entre anuncios</p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                                        <Eye className="w-3 h-3" /> Duración Anuncio (seg)
                                    </label>
                                    <input
                                        type="number"
                                        value={adDuration}
                                        onChange={(e) => setAdDuration(parseInt(e.target.value))}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-padel-primary outline-none"
                                        placeholder="10"
                                    />
                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Tiempo que dura el anuncio</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Efectos de Pizarra</label>
                                    <button
                                        onClick={() => setFunAnimations(!funAnimations)}
                                        className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between ${funAnimations ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase">{funAnimations ? 'Animaciones ON' : 'Animaciones OFF'}</span>
                                        <div className={`w-3 h-3 rounded-full ${funAnimations ? 'bg-amber-400 animate-bounce' : 'bg-gray-700'}`} />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-cyan-400" /> Búsqueda por IA
                                    </label>
                                    <button
                                        onClick={() => setAiSearch(!aiSearch)}
                                        className={`w-full py-3 px-4 rounded-xl border transition-all flex items-center justify-between ${aiSearch ? 'bg-cyan-400/10 border-cyan-400/30 text-cyan-400' : 'bg-white/5 border-white/10 text-gray-500'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase">{aiSearch ? 'IA Activa' : 'Desactivada'}</span>
                                        <div className={`w-3 h-3 rounded-full ${aiSearch ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-gray-700'}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">URLs de Videos/Ads (Pantalla Completa)</label>
                                {adMediaUrls.map((url, idx) => (
                                    <div key={idx} className="flex gap-4">
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={url}
                                                onChange={(e) => {
                                                    const newUrls = [...adMediaUrls];
                                                    newUrls[idx] = e.target.value;
                                                    setAdMediaUrls(newUrls);
                                                }}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-padel-primary"
                                                placeholder="https://...mp4 o imagen"
                                            />
                                            <label className="cursor-pointer group flex items-center justify-center w-10 bg-white/5 border border-white/10 rounded-xl hover:bg-padel-primary/10 hover:border-padel-primary/30 transition-all">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="video/*,image/*"
                                                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ad', idx)}
                                                />
                                                {uploading === `ad-${idx}` ? (
                                                    <Loader2 className="w-4 h-4 text-padel-primary animate-spin" />
                                                ) : (
                                                    <Upload className="w-4 h-4 text-gray-500 group-hover:text-padel-primary" />
                                                )}
                                            </label>
                                        </div>
                                        <button
                                            onClick={() => setAdMediaUrls(adMediaUrls.filter((_, i) => i !== idx))}
                                            className="p-2 text-red-500/40 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setAdMediaUrls([...adMediaUrls, ''])}
                                    className="w-full py-3 border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-padel-primary hover:border-padel-primary/30 transition-all"
                                >
                                    + Añadir Media Publicitario
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* Preview Section */}
                    <div className="col-span-12 lg:col-span-5">
                        <div className="sticky top-10 space-y-6">
                            <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 overflow-hidden flex flex-col items-center">
                                <div className="flex items-center gap-3 self-start mb-8">
                                    <Eye className="w-5 h-5 text-padel-primary" />
                                    <h2 className="text-sm font-black italic uppercase tracking-widest">Vista Previa Broadcast</h2>
                                </div>

                                {/* Miniature Overlay Mockup */}
                                <div className="w-full aspect-video bg-[#0a2f0a] rounded-[2rem] border-4 border-black shadow-2xl relative overflow-hidden flex items-center justify-center group">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-20 grayscale" />

                                    {/* LIVE Button */}
                                    {showLiveIndicator && (
                                        <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-600/40 rounded-full">
                                            <span className="text-[6px] font-black uppercase tracking-tighter text-white">REC LIVE</span>
                                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                        </div>
                                    )}

                                    {/* Score Card Mockup */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] h-12 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-stretch">
                                        <div className="flex-[2] flex items-center px-4 border-r border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: primaryColor, boxShadow: `0 0 10px ${primaryColor}` }} />
                                            <span className="text-[10px] font-black italic uppercase truncate">Team A vs Team B</span>
                                        </div>
                                        <div className="w-12 flex items-center justify-center font-black italic text-lg" style={{ color: primaryColor }}>30:15</div>
                                        <div className="flex-1 flex items-center justify-center bg-white/5 font-black text-[10px] italic">SET 1</div>
                                    </div>

                                    {/* Sponsor Rotation Preview */}
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

                                <div className="mt-8 text-center space-y-4 w-full">
                                    <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Este es un adelanto visual. Los cambios se verán reflejados automáticamente en los enlaces de OBS para todos los partidos activos.</p>

                                    <Link
                                        href={`/tournaments/${id}/control`}
                                        className="block py-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-gray-400"
                                    >
                                        Volver al Panel de Control
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Toast */}
            <AnimatePresence>
                {showSavedToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 right-10 bg-padel-primary text-black px-8 py-4 rounded-2xl font-black italic flex items-center gap-3 shadow-2xl z-50 uppercase tracking-widest text-sm"
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        ¡Configuración Actualizada!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
