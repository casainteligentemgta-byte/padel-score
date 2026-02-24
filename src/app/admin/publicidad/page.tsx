'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { ref as dbRef, onValue, off, set, remove, push } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { rtdb } from '@/lib/rtdb';
import { storage } from '@/lib/firebase';
import { setModoPublicidad, toggleCarrusel, setImagenCarrusel, deleteImagenCarrusel, initPublicidadMaster, setTickerConfig } from '@/lib/rtdbService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Image as ImageIcon, Clock, Video,
    ToggleLeft, ToggleRight, Trash2, Plus, RefreshCw,
    Upload, CheckCircle2, AlertCircle, Radio, Link as LinkIcon,
    Play, Film, BookImage, X, Save, MessageSquare
} from 'lucide-react';

// ── types ───────────────────────────────────────────────────────────────────
type Modo = 'fija' | 'programada' | 'carrusel';
type MediaType = 'imagen' | 'video';

interface MediaItem {
    id: string;
    url: string;
    tipo: MediaType;
    nombre: string;
    creadoEn: number;
}

// ── helpers ──────────────────────────────────────────────────────────────────
const isVideo = (url: string) => /\.(mp4|webm|mov|ogg|m4v)(\?|$)/i.test(url);
const msToLocal = (ms: number) => {
    if (!ms) return '';
    const d = new Date(ms);
    const p = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

// ── CarruselCard (definido ANTES del componente principal) ────────────────────
function CarruselCard({
    adData, carouselItems, biblioteca, onToggle, onDelete, onAddItems
}: {
    adData: any;
    carouselItems: any[];
    biblioteca: MediaItem[];
    onToggle: (v: boolean) => void;
    onDelete: (id: string) => void;
    onAddItems: (urls: string[]) => Promise<void>;
}) {
    const [tab, setTab] = useState<'cola' | 'agregar'>('cola');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [adding, setAdding] = useState(false);

    const urlsEnCarrusel = new Set(carouselItems.map(i => i.url));

    const toggleSelect = (url: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(url) ? next.delete(url) : next.add(url);
            return next;
        });
    };

    const handleAdd = async () => {
        const nuevos = [...selected].filter(u => !urlsEnCarrusel.has(u));
        if (!nuevos.length) return;
        setAdding(true);
        await onAddItems(nuevos);
        setSelected(new Set());
        setTab('cola');
        setAdding(false);
    };

    const isActive = adData?.modo === 'carrusel';

    return (
        <section className={`rounded-2xl border p-4 space-y-3 transition-all ${isActive ? 'border-padel-primary/30 bg-padel-primary/5' : 'border-white/8 bg-white/[0.02]'}`}>
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-padel-primary/20 text-padel-primary' : 'bg-white/8 text-gray-500'}`}>
                    <Radio className="w-3.5 h-3.5" />
                </div>
                <h3 className={`font-black uppercase italic tracking-tight text-sm ${isActive ? 'text-padel-primary' : 'text-gray-400'}`}>Carrusel</h3>
                {isActive && <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-padel-primary text-black px-2 py-0.5 rounded-full">EN USO</span>}
            </div>

            {/* Toggle rotación */}
            <div className="flex items-center justify-between px-3 py-2 bg-black rounded-xl border border-white/10">
                <div>
                    <p className="font-black uppercase text-[10px] tracking-widest">Rotación automática</p>
                    <p className="text-[9px] text-gray-600 mt-0.5">Cada {adData?.carrusel_intervalo_seg || 8}s · {carouselItems.length} elemento{carouselItems.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => onToggle(!adData?.carrusel_activo)}>
                    {adData?.carrusel_activo
                        ? <ToggleRight className="w-8 h-8 text-padel-primary" />
                        : <ToggleLeft className="w-8 h-8 text-gray-600" />}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-black rounded-xl p-0.5 border border-white/8">
                {(['cola', 'agregar'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                        {t === 'cola' ? `📺 Cola (${carouselItems.length})` : `➕ Agregar de biblioteca (${biblioteca.length})`}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'cola' ? (
                    <motion.div key="cola" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="space-y-1.5">
                        {carouselItems.length > 0 ? carouselItems.map((img, idx) => (
                            <div key={img.id} className="flex items-center gap-3 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-colors">
                                <span className="w-5 h-5 rounded-md bg-white/8 flex items-center justify-center text-[9px] font-black text-gray-500 shrink-0">{idx + 1}</span>
                                <div className="w-14 h-9 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black">
                                    {isVideo(img.url)
                                        ? <><video src={img.url} className="w-full h-full object-cover" muted preload="metadata" />
                                            <div className="absolute inset-0 flex items-center justify-center"><Play className="w-3 h-3 text-white" /></div></>
                                        : <img src={img.url} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-white truncate">
                                        {isVideo(img.url) ? '▶️' : '🖼️'} {img.url.split('/').pop()?.split('?')[0] || 'media'}
                                    </p>
                                    <p className="text-[8px] text-gray-700 truncate">{img.url}</p>
                                </div>
                                <button onClick={() => onDelete(img.id)}
                                    className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        )) : (
                            <div className="py-6 text-center">
                                <Radio className="w-6 h-6 text-gray-800 mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase text-gray-700 tracking-widest">Cola vacía</p>
                                <p className="text-[9px] text-gray-800 mt-1">Ve a &quot;Agregar de biblioteca&quot; para seleccionar medios</p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="agregar" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} className="space-y-3">
                        {biblioteca.length === 0 ? (
                            <p className="text-center text-gray-700 text-[10px] font-bold uppercase tracking-widest py-4">
                                Biblioteca vacía · Agrega medios arriba primero
                            </p>
                        ) : (
                            <>
                                <p className="text-[9px] text-gray-600 font-bold">Toca para seleccionar · Los resaltados ya están en la cola</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {biblioteca.map(item => {
                                        const inCarrusel = urlsEnCarrusel.has(item.url);
                                        const isSel = selected.has(item.url);
                                        return (
                                            <button key={item.id}
                                                onClick={() => !inCarrusel && toggleSelect(item.url)}
                                                disabled={inCarrusel}
                                                className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${inCarrusel ? 'border-padel-primary/60 opacity-60 cursor-not-allowed' : isSel ? 'border-padel-primary scale-[1.02] shadow-lg shadow-padel-primary/20' : 'border-white/10 hover:border-white/30'}`}
                                            >
                                                <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                                                    {item.tipo === 'video'
                                                        ? <><video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30"><Play className="w-4 h-4 text-white" /></div></>
                                                        : <img src={item.url} alt={item.nombre} className="w-full h-full object-cover" />}
                                                    {(isSel || inCarrusel) && (
                                                        <div className="absolute inset-0 bg-padel-primary/20 flex items-center justify-center">
                                                            <div className="w-6 h-6 rounded-full bg-padel-primary flex items-center justify-center">
                                                                <CheckCircle2 className="w-4 h-4 text-black" />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-2 py-1.5 bg-[#111]">
                                                    <p className="text-[9px] font-black text-white truncate">{item.nombre}</p>
                                                    <p className="text-[8px] text-gray-600">{inCarrusel ? '✓ Ya en cola' : item.tipo}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {selected.size > 0 && (
                                    <motion.button
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={handleAdd}
                                        disabled={adding}
                                        className="w-full flex items-center justify-center gap-2 bg-padel-primary text-black py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50"
                                    >
                                        {adding
                                            ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Agregando...</>
                                            : <><Plus className="w-3.5 h-3.5" /> Agregar {selected.size} elemento{selected.size > 1 ? 's' : ''} al carrusel</>}
                                    </motion.button>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

// ── MediaPreview ──────────────────────────────────────────────────────────────
function MediaPreview({ url, label }: { url: string; label: string }) {
    const vid = isVideo(url);
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-black"
            style={{ aspectRatio: '16/9' }}
        >
            {vid ? (
                <video src={url} className="w-full h-full object-contain" controls autoPlay muted loop />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={url}
                    alt="preview"
                    className="w-full h-full object-contain"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            )}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2 py-1 rounded-lg">
                <span className={`w-1.5 h-1.5 rounded-full ${vid ? 'bg-blue-400' : 'bg-padel-primary'}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white">{label}</span>
            </div>
            <div className="absolute bottom-2 right-2 text-[8px] font-black uppercase tracking-widest bg-black/60 backdrop-blur px-2 py-0.5 rounded-md text-gray-400">
                {vid ? '▶ video' : '🖼 imagen'}
            </div>
        </motion.div>
    );
}

// ── MediaRow ──────────────────────────────────────────────────────────────────
function MediaRow({ item, onUsarFija, onUsarCarrusel, onDelete }: {
    item: MediaItem;
    onUsarFija: () => void;
    onUsarCarrusel: () => void;
    onDelete: () => void;
}) {
    const vid = item.tipo === 'video';
    return (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-colors">
            {/* Miniatura */}
            <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black">
                {vid
                    ? <><video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Play className="w-3 h-3 text-white" /></div></>
                    : <img src={item.url} alt={item.nombre} className="w-full h-full object-cover" />}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate">{item.nombre}</p>
                <p className="text-[9px] text-gray-600 truncate">{item.url}</p>
            </div>
            {/* Acciones */}
            <div className="flex items-center gap-1 shrink-0">
                <button onClick={onUsarFija} title="Usar como pantalla fija"
                    className="p-1.5 rounded-lg text-gray-600 hover:text-padel-primary hover:bg-padel-primary/10 transition-colors">
                    <ImageIcon className="w-3 h-3" />
                </button>
                <button onClick={onUsarCarrusel} title="Añadir al carrusel"
                    className="p-1.5 rounded-lg text-gray-600 hover:text-blue-400 hover:bg-blue-400/10 transition-colors">
                    <Radio className="w-3 h-3" />
                </button>
                <button onClick={onDelete} title="Eliminar"
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
function Card({ title, icon: Icon, active, children }: {
    title: string;
    icon: React.ElementType;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <section className={`rounded-2xl border p-4 space-y-3 transition-all ${active ? 'border-padel-primary/30 bg-padel-primary/5' : 'border-white/8 bg-white/[0.02]'}`}>
            <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? 'bg-padel-primary/20 text-padel-primary' : 'bg-white/8 text-gray-500'}`}>
                    <Icon className="w-3.5 h-3.5" />
                </div>
                <h3 className={`font-black uppercase italic tracking-tight text-sm ${active ? 'text-padel-primary' : 'text-gray-400'}`}>{title}</h3>
                {active && <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-padel-primary text-black px-2 py-0.5 rounded-full">EN USO</span>}
            </div>
            {children}
        </section>
    );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function AdminPublicidadPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    // RTDB publicidad_master
    const [adData, setAdData] = useState<any>(null);
    const [loadingAd, setLoadingAd] = useState(true);

    // Biblioteca de medios (RTDB: /biblioteca_medios)
    const [biblioteca, setBiblioteca] = useState<MediaItem[]>([]);

    // Formulario nuevo medio
    const [inputUrl, setInputUrl] = useState('');
    const [inputNombre, setInputNombre] = useState('');
    const [inputTipo, setInputTipo] = useState<MediaType>('imagen');
    const [inputMode, setInputMode] = useState<'url' | 'file'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modo activo y settings
    const [fijUrl, setFijUrl] = useState('');
    const [progUrl, setProgUrl] = useState('');
    const [progInicio, setProgInicio] = useState('');
    const [progFin, setProgFin] = useState('');

    // Ticker / correa informativa
    const [tickerActivo, setTickerActivo] = useState(false);
    const [tickerTexto, setTickerTexto] = useState('');
    const [tickerVelocidad, setTickerVelocidad] = useState(30);
    const [savingTicker, setSavingTicker] = useState(false);

    // UI state
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // ── Suscripción RTDB ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAdmin) return;
        const r = dbRef(rtdb, 'publicidad_master');
        const h = (snap: any) => {
            setAdData(snap.val());
            setLoadingAd(false);
        };
        onValue(r, h);
        return () => off(r, 'value', h);
    }, [isAdmin]);

    // Biblioteca
    useEffect(() => {
        if (!isAdmin) return;
        const r = dbRef(rtdb, 'biblioteca_medios');
        const h = (snap: any) => {
            const val = snap.val();
            if (val) {
                const items: MediaItem[] = Object.entries(val).map(([id, v]: any) => ({ id, ...v }));
                items.sort((a, b) => b.creadoEn - a.creadoEn);
                setBiblioteca(items);
            } else {
                setBiblioteca([]);
            }
        };
        onValue(r, h);
        return () => off(r, 'value', h);
    }, [isAdmin]);

    // Sync fijUrl y ticker con RTDB
    useEffect(() => {
        if (adData?.fija?.url) setFijUrl(adData.fija.url);
        if (adData?.programada?.url) setProgUrl(adData.programada.url);
        if (adData?.programada?.inicio_unix_ms) setProgInicio(msToLocal(adData.programada.inicio_unix_ms));
        if (adData?.programada?.fin_unix_ms) setProgFin(msToLocal(adData.programada.fin_unix_ms));
        if (adData?.ticker) {
            setTickerActivo(adData.ticker.activo ?? false);
            setTickerTexto(adData.ticker.texto ?? '');
            setTickerVelocidad(adData.ticker.velocidad_seg ?? 30);
        }
    }, [adData]);

    const notify = (type: 'ok' | 'err', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    // ── Guardar medio desde URL ───────────────────────────────────────────────
    const handleSaveUrl = async () => {
        if (!inputUrl.trim()) { notify('err', 'Ingresa una URL'); return; }
        const autoTipo: MediaType = isVideo(inputUrl.trim()) ? 'video' : inputTipo;
        const item: Omit<MediaItem, 'id'> = {
            url: inputUrl.trim(),
            tipo: autoTipo,
            nombre: inputNombre.trim() || inputUrl.trim().split('/').pop()?.split('?')[0] || 'sin nombre',
            creadoEn: Date.now(),
        };
        const newRef = push(dbRef(rtdb, 'biblioteca_medios'));
        await set(newRef, item);
        setInputUrl('');
        setInputNombre('');
        setPreviewUrl('');
        notify('ok', 'Medio guardado en biblioteca');
    };

    // ── Subir archivo ─────────────────────────────────────────────────────────
    const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) { notify('err', 'Archivo muy grande. Máximo 100 MB.'); return; }
        const path = `publicidad/${Date.now()}_${file.name}`;
        const sRef = storageRef(storage, path);
        const task = uploadBytesResumable(sRef, file);
        setUploadProgress(0);
        task.on(
            'state_changed',
            snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            err => {
                console.error('Upload error:', err);
                notify('err', `Error al subir: ${err.message}`);
                setUploadProgress(null);
            },
            async () => {
                try {
                    const url = await getDownloadURL(task.snapshot.ref);
                    const autoTipo: MediaType = isVideo(file.name) ? 'video' : 'imagen';
                    const item: Omit<MediaItem, 'id'> = {
                        url,
                        tipo: autoTipo,
                        nombre: inputNombre.trim() || file.name,
                        creadoEn: Date.now(),
                    };
                    const newRef = push(dbRef(rtdb, 'biblioteca_medios'));
                    await set(newRef, item);
                    setPreviewUrl(url);
                    setInputNombre('');
                    setUploadProgress(null);
                    notify('ok', 'Archivo subido y guardado');
                } catch (err2: any) {
                    notify('err', `Error al obtener URL: ${err2.message}`);
                    setUploadProgress(null);
                }
            }
        );
    };

    // ── Eliminar medio ────────────────────────────────────────────────────────
    const handleDeleteItem = async (id: string) => {
        await remove(dbRef(rtdb, `biblioteca_medios/${id}`));
        notify('ok', 'Eliminado de biblioteca');
    };

    // ── Usar como imagen fija ─────────────────────────────────────────────────
    const handleUsarComoFija = async (url: string) => {
        await set(dbRef(rtdb, 'publicidad_master/fija/url'), url);
        await setModoPublicidad('fija');
        notify('ok', 'Activado como imagen/video fijo');
    };

    // ── Agregar UN medio al carrusel ──────────────────────────────────────────
    const handleUsarEnCarrusel = async (url: string) => {
        const id = `img_${Date.now()}`;
        const orden = (adData?.imagenes ? Object.keys(adData.imagenes).length : 0) + 1;
        await setImagenCarrusel(id, url, orden);
        notify('ok', 'Agregado al carrusel');
    };

    // ── Agregar MÚLTIPLES medios al carrusel ──────────────────────────────────
    const handleUsarEnCarruselMulti = async (urls: string[]) => {
        if (!urls.length) return;
        const baseOrden = adData?.imagenes ? Object.keys(adData.imagenes).length : 0;
        const promises = urls.map((url, i) => {
            const id = `img_${Date.now()}_${i}`;
            return setImagenCarrusel(id, url, baseOrden + i + 1);
        });
        await Promise.all(promises);
        notify('ok', `${urls.length} elemento${urls.length > 1 ? 's' : ''} agregado${urls.length > 1 ? 's' : ''} al carrusel`);
    };

    // ── Guardar banner programado ─────────────────────────────────────────────
    const handleSaveProgramada = async () => {
        if (!progUrl.trim() || !progInicio || !progFin) { notify('err', 'Completa URL, inicio y fin'); return; }
        const ini = new Date(progInicio).getTime();
        const fin2 = new Date(progFin).getTime();
        if (ini >= fin2) { notify('err', 'Inicio debe ser antes que fin'); return; }
        setSaving(true);
        try {
            await set(dbRef(rtdb, 'publicidad_master/programada'), { url: progUrl.trim(), inicio_unix_ms: ini, fin_unix_ms: fin2 });
            notify('ok', 'Banner programado guardado');
        } catch { notify('err', 'Error'); }
        finally { setSaving(false); }
    };

    const carouselItems = adData?.imagenes
        ? Object.entries(adData.imagenes as Record<string, any>)
            .map(([id, v]) => ({ id, ...(v as any) }))
            .sort((a, b) => a.orden - b.orden)
        : [];

    // ── Loading ───────────────────────────────────────────────────────────────
    if (authLoading || loadingAd) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-padel-primary animate-spin" />
        </div>
    );
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-outfit pb-28">

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="px-6 pt-8 pb-4 border-b border-white/5 flex items-center gap-3">
                <button onClick={() => router.back()} className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-400" />
                </button>
                <div>
                    <h1 className="font-black uppercase italic text-lg tracking-tight">Publicidad</h1>
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Panel de gestión de pantalla</p>
                </div>
            </div>

            {/* ── Feedback ───────────────────────────────────────────────── */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className={`mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl border text-[11px] font-black ${feedback.type === 'ok' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                    >
                        {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                        {feedback.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pt-6 space-y-4">

                {/* ── Selector de modo ───────────────────────────────────── */}
                <div className="flex gap-2">
                    {(['fija', 'programada', 'carrusel'] as Modo[]).map(m => (
                        <button key={m}
                            onClick={() => setModoPublicidad(m)}
                            className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all ${adData?.modo === m ? 'border-padel-primary bg-padel-primary/10 text-padel-primary' : 'border-white/8 text-gray-600 hover:border-white/20'}`}
                        >
                            {m === 'fija' && <ImageIcon className="w-4 h-4" />}
                            {m === 'programada' && <Clock className="w-4 h-4" />}
                            {m === 'carrusel' && <Radio className="w-4 h-4" />}
                            <span className="text-[9px] font-black uppercase tracking-widest">{m}</span>
                            {adData?.modo === m && <span className="w-1.5 h-1.5 rounded-full bg-padel-primary animate-pulse" />}
                        </button>
                    ))}
                </div>

                {/* ── Agregar nuevo medio ────────────────────────────────── */}
                <Card title="Agregar Medio a Biblioteca" icon={BookImage}>
                    {/* Toggle URL / Archivo */}
                    <div className="flex gap-1 bg-black rounded-xl p-0.5 border border-white/8">
                        {(['url', 'file'] as const).map(m => (
                            <button key={m} onClick={() => setInputMode(m)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === m ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                                {m === 'url' ? <><LinkIcon className="w-3 h-3" /> URL</> : <><Upload className="w-3 h-3" /> Archivo</>}
                            </button>
                        ))}
                    </div>

                    {/* Nombre */}
                    <input
                        value={inputNombre}
                        onChange={e => setInputNombre(e.target.value)}
                        placeholder="Nombre (opcional)"
                        className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40"
                    />

                    {inputMode === 'url' ? (
                        <>
                            <input
                                value={inputUrl}
                                onChange={e => { setInputUrl(e.target.value); setPreviewUrl(e.target.value); }}
                                placeholder="https://example.com/imagen.jpg"
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40"
                            />
                            {/* Tipo manual si no se detecta auto */}
                            {inputUrl && !isVideo(inputUrl) && (
                                <div className="flex gap-1">
                                    {(['imagen', 'video'] as const).map(t => (
                                        <button key={t} onClick={() => setInputTipo(t)}
                                            className={`flex-1 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${inputTipo === t ? 'border-padel-primary text-padel-primary bg-padel-primary/10' : 'border-white/8 text-gray-600'}`}>
                                            {t === 'imagen' ? '🖼 Imagen' : '▶ Video'}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {/* Preview en tiempo real */}
                            <AnimatePresence>
                                {previewUrl && (
                                    <MediaPreview url={previewUrl} label={isVideo(previewUrl) ? 'Video' : 'Imagen'} />
                                )}
                            </AnimatePresence>
                            <button onClick={handleSaveUrl}
                                className="w-full flex items-center justify-center gap-2 bg-padel-primary text-black py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform">
                                <Save className="w-3.5 h-3.5" /> Guardar en biblioteca
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:border-padel-primary/40 hover:text-padel-primary transition-colors"
                            >
                                <Upload className="w-4 h-4" /> Seleccionar archivo
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*,video/mp4,video/webm,video/mov" className="hidden" onChange={handleUploadFile} />
                            {uploadProgress !== null && (
                                <div className="space-y-1">
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div className="h-full bg-padel-primary rounded-full" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                    <p className="text-[9px] text-gray-600 text-center font-bold">{uploadProgress}%</p>
                                </div>
                            )}
                            {previewUrl && <MediaPreview url={previewUrl} label="Subido" />}
                        </>
                    )}
                </Card>

                {/* ── Biblioteca de medios ───────────────────────────────── */}
                {biblioteca.length > 0 && (
                    <Card title={`Biblioteca (${biblioteca.length})`} icon={Film}>
                        <div className="space-y-1.5">
                            {biblioteca.map(item => (
                                <MediaRow
                                    key={item.id}
                                    item={item}
                                    onUsarFija={() => handleUsarComoFija(item.url)}
                                    onUsarCarrusel={() => handleUsarEnCarrusel(item.url)}
                                    onDelete={() => handleDeleteItem(item.id)}
                                />
                            ))}
                        </div>
                    </Card>
                )}

                {/* ── Imagen fija ────────────────────────────────────────── */}
                <Card title="Pantalla Fija" icon={ImageIcon} active={adData?.modo === 'fija'}>
                    <div className="space-y-2">
                        {adData?.fija?.url && (
                            <MediaPreview url={adData.fija.url} label="Activo ahora" />
                        )}
                        <input
                            value={fijUrl}
                            onChange={e => setFijUrl(e.target.value)}
                            placeholder="URL de imagen o video"
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40"
                        />
                        <button
                            onClick={async () => {
                                if (!fijUrl.trim()) return notify('err', 'Ingresa una URL');
                                await set(dbRef(rtdb, 'publicidad_master/fija/url'), fijUrl.trim());
                                await setModoPublicidad('fija');
                                notify('ok', 'Imagen fija activada');
                            }}
                            className="w-full bg-padel-primary text-black py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform"
                        >
                            Activar pantalla fija
                        </button>
                    </div>
                </Card>

                {/* ── Banner programado ──────────────────────────────────── */}
                <Card title="Banner Programado" icon={Clock} active={adData?.modo === 'programada'}>
                    <div className="space-y-2">
                        {adData?.programada?.url && (
                            <MediaPreview url={adData.programada.url} label="Programado" />
                        )}
                        <input
                            value={progUrl}
                            onChange={e => setProgUrl(e.target.value)}
                            placeholder="URL del banner"
                            className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-[9px] text-gray-600 font-bold mb-1">Inicio</p>
                                <input type="datetime-local" value={progInicio} onChange={e => setProgInicio(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-padel-primary/40" />
                            </div>
                            <div>
                                <p className="text-[9px] text-gray-600 font-bold mb-1">Fin</p>
                                <input type="datetime-local" value={progFin} onChange={e => setProgFin(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-xl px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-padel-primary/40" />
                            </div>
                        </div>
                        <button onClick={handleSaveProgramada} disabled={saving}
                            className="w-full flex items-center justify-center gap-2 bg-padel-primary text-black py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50">
                            {saving ? <><RefreshCw className="w-3 h-3 animate-spin" /> Guardando...</> : <><Save className="w-3 h-3" /> Guardar y activar</>}
                        </button>
                    </div>
                </Card>

                {/* ── Carrusel ───────────────────────────────────────────── */}
                <CarruselCard
                    adData={adData}
                    carouselItems={carouselItems}
                    biblioteca={biblioteca}
                    onToggle={(v) => toggleCarrusel(v)}
                    onDelete={(id) => deleteImagenCarrusel(id)}
                    onAddItems={handleUsarEnCarruselMulti}
                />

                {/* ── Correa Informativa (Ticker) ─────────────────────────── */}
                <Card title="Correa Informativa" icon={MessageSquare} active={tickerActivo}>
                    <div className="space-y-3">

                        {/* Toggle activo */}
                        <div className="flex items-center justify-between px-3 py-2.5 bg-black rounded-xl border border-white/10">
                            <div>
                                <p className="font-black uppercase text-[10px] tracking-widest text-white">Mostrar correa</p>
                                <p className="text-[9px] text-gray-600 mt-0.5">Aparece en la barra inferior de la pantalla</p>
                            </div>
                            <button onClick={() => setTickerActivo(v => !v)}>
                                {tickerActivo
                                    ? <ToggleRight className="w-9 h-9 text-padel-primary" />
                                    : <ToggleLeft className="w-9 h-9 text-gray-600" />}
                            </button>
                        </div>

                        {/* Texto */}
                        <div>
                            <p className="text-[9px] text-gray-500 font-bold mb-1 uppercase tracking-widest">Texto de la correa</p>
                            <textarea
                                value={tickerTexto}
                                onChange={e => setTickerTexto(e.target.value)}
                                placeholder="Ej: Bienvenidos al torneo · Próximo partido a las 18:00 · Club Smart Padel"
                                rows={3}
                                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40 resize-none"
                            />
                            <p className="text-[8px] text-gray-700 mt-1">Usa · para separar items. El texto se repite en bucle.</p>
                        </div>

                        {/* Velocidad */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Velocidad de desplazamiento</p>
                                <span className="text-[10px] font-black text-padel-primary">{tickerVelocidad}s por ciclo</span>
                            </div>
                            <input
                                type="range"
                                min={10} max={90} step={5}
                                value={tickerVelocidad}
                                onChange={e => setTickerVelocidad(Number(e.target.value))}
                                className="w-full accent-[#ccff00]"
                            />
                            <div className="flex justify-between text-[8px] text-gray-700 font-bold mt-0.5">
                                <span>Rápido (10s)</span>
                                <span>Lento (90s)</span>
                            </div>
                        </div>

                        {/* Preview */}
                        {tickerTexto && (
                            <div className="overflow-hidden rounded-xl border border-white/10 bg-black" style={{ height: '36px' }}>
                                <div className="flex items-center h-full" style={{ animation: `marquee ${tickerVelocidad}s linear infinite` }}>
                                    {[0, 1].map(i => (
                                        <span key={i} className="whitespace-nowrap font-black italic uppercase tracking-tighter text-[11px] px-8"
                                            style={{ color: '#ccff00' }}>
                                            {tickerTexto}
                                        </span>
                                    ))}
                                </div>
                                <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
                            </div>
                        )}

                        {/* Guardar */}
                        <button
                            onClick={async () => {
                                setSavingTicker(true);
                                try {
                                    await setTickerConfig(tickerActivo, tickerTexto.trim(), tickerVelocidad);
                                    notify('ok', tickerActivo ? 'Correa activada y guardada' : 'Correa desactivada');
                                } catch { notify('err', 'Error al guardar correa'); }
                                finally { setSavingTicker(false); }
                            }}
                            disabled={savingTicker}
                            className="w-full flex items-center justify-center gap-2 bg-padel-primary text-black py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                            {savingTicker
                                ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                                : <><Save className="w-3.5 h-3.5" /> Guardar correa</>}
                        </button>
                    </div>
                </Card>

            </div>
        </div>
    );
}
