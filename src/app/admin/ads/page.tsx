'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { motion } from 'framer-motion';
import { Megaphone, Save, Trash2, Plus, Image as ImageIcon, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdsManagementPage() {
    const { isAdmin, loading: authLoading, user } = useAuth();
    const router = useRouter();
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Form state for a new ad
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        targetUrl: '',
        active: true,
        duration: 10,
        themeColor: '#ccff00'
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        } else if (!authLoading && isAdmin) {
            loadAds();
        }
    }, [isAdmin, authLoading, router]);

    const loadAds = async () => {
        setLoading(true);
        try {
            const data = await dataService.getAds();
            setAds(data);
        } catch (error) {
            console.error('Error loading ads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSave = async () => {
        if (!formData.title || (!selectedFile && !formData.imageUrl)) {
            alert('Por favor, completa el título y selecciona un archivo.');
            return;
        }

        if (!user) return;

        setIsSaving(true);
        try {
            let finalImageUrl = formData.imageUrl;

            if (selectedFile) {
                const path = `ads/${Date.now()}_${selectedFile.name}`;
                finalImageUrl = await dataService.uploadFile(selectedFile, path);
            }

            const detectedType = selectedFile
                ? (selectedFile.type.includes('video') ? 'video' : 'image')
                : (finalImageUrl.toLowerCase().endsWith('.mp4') ? 'video' : 'image');

            await dataService.createAd({
                ...formData,
                imageUrl: finalImageUrl,
                type: detectedType
            }, user.uid);

            setFormData({ title: '', imageUrl: '', targetUrl: '', active: true, duration: 10, themeColor: '#ccff00' });
            setSelectedFile(null);
            setPreviewUrl('');
            loadAds();
            alert('Anuncio guardado con éxito');
        } catch (error) {
            console.error('Error saving ad:', error);
            alert('Error al guardar el anuncio');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Seguro que deseas eliminar este anuncio?')) return;
        try {
            await dataService.deleteAd(id);
            loadAds();
        } catch (error) {
            console.error('Error deleting ad:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 bg-padel-primary/10 border border-padel-primary/20 rounded-2xl flex items-center justify-center shadow-lg shadow-padel-primary/5">
                            <Megaphone className="w-6 h-6 text-padel-primary" />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">
                            Gestión de <span className="text-padel-primary">Publicidad</span>
                        </h1>
                    </div>
                    <p className="text-zinc-400 font-medium ml-16">Administra los banners y videos de la pantalla de inicio.</p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    {/* Form Section */}
                    <section className="glass p-8 border border-white/5 rounded-3xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-padel-primary" /> Nuevo Anuncio
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Título / Cliente</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Ej: Gatorade - Torneo Verano"
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Tipo de Origen</label>
                                    <div className="flex gap-2 p-1 bg-zinc-900/80 rounded-xl border border-zinc-800">
                                        <button
                                            onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${!selectedFile ? 'bg-padel-primary text-black' : 'text-zinc-500 hover:text-white'}`}
                                        >
                                            URL Web
                                        </button>
                                        <label className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all text-center cursor-pointer ${selectedFile ? 'bg-padel-primary text-black' : 'text-zinc-500 hover:text-white'}`}>
                                            Subir Archivo
                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-900">
                                {!selectedFile ? (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Enlace Directo del Recurso (Video/Imagen)</label>
                                        <input
                                            type="text"
                                            value={formData.imageUrl}
                                            onChange={(e) => {
                                                setFormData({ ...formData, imageUrl: e.target.value });
                                                setPreviewUrl(e.target.value);
                                            }}
                                            placeholder="https://ejemplo.com/banner.mp4"
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                        />
                                        <p className="text-[9px] text-zinc-600 italic">Pega un enlace directo a un archivo MP4, JPG o PNG.</p>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-padel-primary/10 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-5 h-5 text-padel-primary" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase">{selectedFile.name}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase">Listo para subir • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedFile(null); setPreviewUrl(''); }} className="text-[10px] font-black text-red-500 uppercase hover:underline">Cambiar</button>
                                    </div>
                                )}
                            </div>

                            {previewUrl && (
                                <div className="w-full h-48 bg-black/50 rounded-2xl overflow-hidden border border-zinc-800 relative group shadow-2xl">
                                    {(selectedFile?.type.includes('video') || previewUrl.toLowerCase().endsWith('.mp4')) ? (
                                        <video src={previewUrl} className="w-full h-full object-cover opacity-60" autoPlay muted loop />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-60" />
                                    )}
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/5">Vista Previa en Tiempo Real</p>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Duración (segundos)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 5 })}
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                        min="1"
                                        max="60"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Color de Marca</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            value={formData.themeColor}
                                            onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                                            className="w-12 h-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 outline-none cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.themeColor}
                                            onChange={(e) => setFormData({ ...formData, themeColor: e.target.value })}
                                            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all font-mono"
                                            placeholder="#ccff00"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Enlace al hacer clic (Web del Cliente)</label>
                                <input
                                    type="text"
                                    value={formData.targetUrl}
                                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                                    placeholder="https://tienda.com/promo"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className={`w-full bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all group shadow-lg shadow-padel-primary/10 tracking-widest ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? (
                                    <>SOLTANDO MAGIA... <Sparkles className="w-5 h-5 animate-pulse" /></>
                                ) : (
                                    <>SUBIR Y ACTIVAR <Save className="w-5 h-5 group-hover:scale-110 transition-transform" /></>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Current Ads Section */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-400">
                                <CheckCircle2 className="w-5 h-5 text-padel-primary" /> Banner página de inicio
                            </h2>
                            <button onClick={loadAds} className="text-[10px] font-bold text-zinc-500 uppercase hover:text-padel-primary flex items-center gap-1">
                                Actualizar Lista
                            </button>
                        </div>

                        {ads.length === 0 ? (
                            <div className="border border-dashed border-zinc-800/50 rounded-3xl p-16 text-center space-y-4 bg-zinc-900/20">
                                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800">
                                    <ImageIcon className="w-8 h-8 text-zinc-700" />
                                </div>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Aún no hay anuncios en la base de datos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {ads.map((ad, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={ad.id}
                                        className="relative group h-32 rounded-3xl overflow-hidden glass border border-white/5 hover:border-padel-primary/20 transition-all shadow-2xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10 flex items-center px-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center flex-shrink-0 shadow-xl">
                                                    {ad.type === 'video' || ad.imageUrl?.toLowerCase().endsWith('.mp4') ? (
                                                        <video src={ad.imageUrl} className="w-full h-full object-cover" muted />
                                                    ) : (
                                                        <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white text-xl uppercase italic tracking-tighter leading-none mb-1">{ad.title}</h4>
                                                    <div className="flex items-center gap-4">
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ad.active ? 'bg-padel-primary/20 text-padel-primary border border-padel-primary/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                                                            {ad.active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
                                                            📅 {ad.createdAt?.seconds ? new Date(ad.createdAt.seconds * 1000).toLocaleDateString() : 'Recién creado'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex items-center gap-3">
                                            {ad.targetUrl && (
                                                <a
                                                    href={ad.targetUrl}
                                                    target="_blank"
                                                    className="w-12 h-12 bg-white/5 hover:bg-padel-primary/20 text-white hover:text-padel-primary rounded-2xl flex items-center justify-center transition-all border border-white/10 hover:border-padel-primary/30 backdrop-blur-md"
                                                    title="Ver Web"
                                                >
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => handleDelete(ad.id)}
                                                className="w-12 h-12 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all border border-red-500/10 hover:border-red-500 shadow-lg shadow-red-500/5"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {ad.type === 'video' || ad.imageUrl?.toLowerCase().endsWith('.mp4') ? (
                                            <video src={ad.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" muted />
                                        ) : (
                                            <img src={ad.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity" alt="" />
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

