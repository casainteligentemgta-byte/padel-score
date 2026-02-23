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
        active: true
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

            await dataService.createAd({
                ...formData,
                imageUrl: finalImageUrl,
                type: selectedFile?.type.includes('video') ? 'video' : 'image'
            }, user.uid);

            setFormData({ title: '', imageUrl: '', targetUrl: '', active: true });
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
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Archivo Multimedia</label>
                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 w-full bg-zinc-800/50 border border-dashed border-zinc-700 hover:border-padel-primary/50 rounded-xl px-4 py-3 text-xs font-bold transition-all">
                                                <ImageIcon className="w-4 h-4 text-padel-primary" />
                                                {selectedFile ? selectedFile.name.substring(0, 15) + '...' : 'SELECCIONAR ARCHIVO'}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {previewUrl && (
                                <div className="w-full h-40 bg-black/50 rounded-2xl overflow-hidden border border-zinc-800 relative group">
                                    {selectedFile?.type.includes('video') ? (
                                        <video src={previewUrl} className="w-full h-full object-cover opacity-50" />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white bg-black/50 px-3 py-1 rounded-full">Vista Previa</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Enlace de Destino (Opcional)</label>
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
                                className={`w-full bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all group shadow-lg shadow-padel-primary/10 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSaving ? 'SUBIENDO...' : 'SUBIR Y ACTIVAR'} <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </section>

                    {/* Current Ads Section */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-400">
                            <CheckCircle2 className="w-5 h-5" /> Anuncios Activos
                        </h2>

                        {ads.length === 0 ? (
                            <div className="border border-dashed border-zinc-800 rounded-3xl p-12 text-center">
                                <p className="text-zinc-500 text-sm font-bold uppercase">No hay anuncios configurados</p>
                            </div>
                        ) : (
                            ads.map((ad) => (
                                <div key={ad.id} className="glass p-6 flex items-center justify-between group border border-white/5 rounded-3xl hover:border-padel-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-24 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
                                            {ad.type === 'video' ? (
                                                <div className="text-[8px] font-bold text-padel-primary">VIDEO</div>
                                            ) : (
                                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white uppercase italic tracking-tighter">{ad.title}</h4>
                                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                                                {ad.active ? 'Activo' : 'Inactivo'} • {new Date(ad.createdAt?.seconds * 1000).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDelete(ad.id)}
                                            className="p-3 bg-zinc-900/50 hover:bg-red-500/20 text-zinc-600 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {ad.targetUrl && (
                                            <a
                                                href={ad.targetUrl}
                                                target="_blank"
                                                className="p-3 bg-zinc-900/50 hover:bg-padel-primary/20 text-zinc-600 hover:text-padel-primary rounded-xl transition-all border border-transparent hover:border-padel-primary/20"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
