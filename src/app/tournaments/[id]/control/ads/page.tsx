'use client';

import { useState, useEffect, use } from 'react';
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
    Pause,
    Eye,
    Maximize2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { db, storage } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function AdsManagement({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showSavedToast, setShowSavedToast] = useState(false);

    // Form state
    const [adFrequency, setAdFrequency] = useState(60);
    const [adDuration, setAdDuration] = useState(10);
    const [adMediaUrls, setAdMediaUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState<number | null>(null);
    const [previewIdx, setPreviewIdx] = useState<number | null>(null);

    const SAMPLE_VIDEO = "https://assets.mixkit.co/videos/preview/mixkit-man-playing-padel-tennis-41484-large.mp4";

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        if (!id || authLoading || !isAdmin) return;

        const docRef = doc(db, 'tournaments', id);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setTournament({ id: docSnap.id, ...data });

                if (data.broadcastingSettings) {
                    setAdFrequency(data.broadcastingSettings.adFrequencySeconds || 60);
                    setAdDuration(data.broadcastingSettings.adDurationSeconds || 10);
                    setAdMediaUrls(data.broadcastingSettings.adMediaUrls || []);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [id, authLoading, isAdmin]);

    const handleFileUpload = async (file: File, index: number) => {
        setUploading(index);
        try {
            const fileRef = ref(storage, `tournaments/${id}/ads/${Date.now()}_${file.name}`);
            await uploadBytes(fileRef, file);
            const url = await getDownloadURL(fileRef);

            const newUrls = [...adMediaUrls];
            newUrls[index] = url;
            setAdMediaUrls(newUrls);
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir el archivo');
        } finally {
            setUploading(null);
        }
    };

    const addAd = () => {
        setAdMediaUrls([...adMediaUrls, '']);
    };

    const removeAd = (index: number) => {
        setAdMediaUrls(adMediaUrls.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const docRef = doc(db, 'tournaments', id);
            await updateDoc(docRef, {
                'broadcastingSettings.adFrequencySeconds': adFrequency,
                'broadcastingSettings.adDurationSeconds': adDuration,
                'broadcastingSettings.adMediaUrls': adMediaUrls
            });
            setShowSavedToast(true);
            setTimeout(() => setShowSavedToast(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4 pl-28">
            <Loader2 className="w-12 h-12 text-padel-primary animate-spin" />
            <p className="text-padel-primary font-black italic uppercase tracking-widest text-xs">Cargando Módulo de Publicidad...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white flex font-outfit">
            <Sidebar />

            <div className="flex-1 flex flex-col p-8 pl-32 max-w-7xl mx-auto w-full gap-8 relative pb-24">
                {/* Header */}
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
                                Gestión de <span className="text-padel-primary">Publicidad</span>
                            </h1>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Configura los anuncios de la TV de Pista</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 bg-padel-primary text-black px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(204,255,0,0.2)] disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Configuration */}
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
                                    <input
                                        type="range"
                                        min="30"
                                        max="300"
                                        step="10"
                                        value={adFrequency}
                                        onChange={(e) => setAdFrequency(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-padel-primary"
                                    />
                                    <p className="text-[9px] text-gray-600 font-bold leading-relaxed italic">Cada cuánto tiempo se mostrará un anuncio en la pantalla principal.</p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Duración (segundos)</label>
                                        <span className="text-xl font-black italic text-padel-primary">{adDuration}s</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="5"
                                        max="60"
                                        step="5"
                                        value={adDuration}
                                        onChange={(e) => setAdDuration(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-padel-primary"
                                    />
                                    <p className="text-[9px] text-gray-600 font-bold leading-relaxed italic">Cuánto tiempo permanecerá visible cada anuncio antes de volver al marcador.</p>
                                </div>
                            </div>
                        </section>

                        {/* Preview / Placeholder Info */}
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

                    {/* Right: Media Management */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <section className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-8 backdrop-blur-md">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <Video className="w-6 h-6 text-padel-primary" />
                                    <h2 className="text-lg font-black italic uppercase tracking-tight">Galería de Anuncios</h2>
                                </div>
                                <button
                                    onClick={addAd}
                                    className="p-3 bg-padel-primary text-black rounded-2xl hover:scale-110 transition-all shadow-[0_10px_20px_rgba(204,255,0,0.2)]"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {adMediaUrls.length === 0 && (
                                    <div className="col-span-2 py-20 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 opacity-30">
                                        <div className="p-5 bg-white/5 rounded-full">
                                            <Video className="w-10 h-10" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-[0.2em] italic">No hay anuncios registrados</p>
                                    </div>
                                )}
                                {adMediaUrls.map((url, idx) => (
                                    <div key={idx} className="group relative bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden aspect-video transition-all hover:border-padel-primary/40">
                                        {/* Preview Content */}
                                        {url ? (
                                            url.toLowerCase().endsWith('.mp4') ? (
                                                <video src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            ) : (
                                                <img src={url} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                            )
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-white/[0.01]">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                                                    <Upload className="w-6 h-6 text-gray-600" />
                                                </div>
                                                <p className="text-[8px] font-black uppercase text-gray-600 tracking-widest">Subir Imagen o Video</p>
                                            </div>
                                        )}

                                        {/* Overlay Controls */}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-6 flex items-center justify-between translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                            <div className="flex gap-2">
                                                <label className="p-3 bg-white text-black rounded-xl cursor-pointer hover:scale-105 transition-all">
                                                    <Upload className="w-4 h-4" />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,video/*"
                                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], idx)}
                                                    />
                                                </label>
                                                {url && (
                                                    <button
                                                        onClick={() => setPreviewIdx(idx)}
                                                        className="p-3 bg-padel-primary text-black rounded-xl hover:scale-105 transition-all"
                                                    >
                                                        <Maximize2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeAd(idx)}
                                                className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 transition-all hover:text-white"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Uploading Progress */}
                                        {uploading === idx && (
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
                </div>

                {/* Saved Toast */}
                <AnimatePresence>
                    {showSavedToast && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[200] bg-padel-primary text-black px-10 py-5 rounded-full font-black italic uppercase text-xs tracking-widest shadow-[0_20px_50px_rgba(204,255,0,0.5)] border-4 border-black flex items-center gap-4"
                        >
                            <CheckCircle2 className="w-6 h-6" />
                            Configuración Actualizada Exitosamente
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Media Preview Modal */}
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
                                {adMediaUrls[previewIdx].toLowerCase().endsWith('.mp4') ? (
                                    <video src={adMediaUrls[previewIdx]} controls autoPlay className="w-full h-full object-contain" />
                                ) : (
                                    <img src={adMediaUrls[previewIdx]} className="w-full h-full object-contain p-12" />
                                )}
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
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}

function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}
