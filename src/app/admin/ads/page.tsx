'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { motion } from 'framer-motion';
import { Megaphone, Save, Trash2, Plus, Image as ImageIcon, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdsManagementPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [ads, setAds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form state for a new/editing ad
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        targetUrl: '',
        active: true
    });

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, authLoading, router]);

    const loadAds = async () => {
        setLoading(true);
        try {
            // Placeholder: This will be implemented in dataService
            // For now we set empty to avoid crash
            const data: any[] = [];
            setAds(data);
        } catch (error) {
            console.error('Error loading ads:', error);
        } finally {
            setLoading(false);
        }
    };

    // Since I can't edit dataService easily without seeing all calls, 
    // I'll implement local helper here for now or prepare to edit dataService.

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
                    <section className="glass p-8">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-padel-primary" /> Nuevo Anuncio
                        </h2>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Título / Cliente</label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Gatorade - Torneo Verano"
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">URL de Imagen/Video</label>
                                    <input
                                        type="text"
                                        placeholder="https://..."
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Enlace de Destino (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="https://tienda.com/promo"
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:border-padel-primary/50 outline-none transition-all"
                                />
                            </div>
                            <button className="w-full bg-padel-primary hover:bg-white text-black font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all group shadow-lg shadow-padel-primary/10">
                                SUBIR Y ACTIVAR <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    </section>

                    {/* Current Ads Section */}
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-zinc-400">
                            <CheckCircle2 className="w-5 h-5" /> Anuncios Activos
                        </h2>

                        {/* Empty State / Example */}
                        <div className="glass p-6 flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-16 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
                                    <ImageIcon className="text-zinc-700 w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white uppercase italic tracking-tighter">Espacio de Prueba</h4>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Activo • Visible en Inicio</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button className="p-3 bg-zinc-900 hover:bg-zinc-800 text-padel-primary rounded-xl transition-all">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
