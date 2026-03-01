'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { getAuthHeaders } from '@/lib/apiAuth';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query as fsQuery } from 'firebase/firestore';
import { ref as dbRef, onValue, off, set, remove, push } from 'firebase/database';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { rtdb } from '@/lib/rtdb';
import { storage } from '@/lib/firebase';
import { setModoPublicidad, toggleCarrusel, setImagenCarrusel, deleteImagenCarrusel, setTickerConfig, setCronometroTipo, setRelojTipo, setRelojModelo, setRelojModeloActivo, setLogoEvento, setLogosPatrocinantes, setVideoEsquina, setTickerTipoYAnimaciones, setAnimacionMarcador, type CronometroTipo, type RelojTipo } from '@/lib/rtdbService';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Megaphone, Image as ImageIcon, Clock, Video,
    ToggleLeft, ToggleRight, Trash2, Plus, RefreshCw,
    Upload, CheckCircle2, AlertCircle, Radio, Link as LinkIcon,
    Play, Film, BookImage, X, Save, MessageSquare,
    Monitor, Maximize2, Zap,     Trophy, Check, Layout, Youtube, Settings,
    ChevronRight, ChevronLeft, ExternalLink, MapPin, Search as SearchIcon,
    Timer, ImagePlus, Sparkles, Type
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';
import { MatchStatus } from '@/types/tournament';

const COMPLEXES = [
    { name: 'Margarita Padel', courts: 6 },
    { name: 'Tibisay', courts: 3 },
    { name: 'Sun Sol Costa Azul', courts: 4 },
    { name: 'Food Kart', courts: 3 },
    { name: 'Elite', courts: 4 },
    { name: 'Bodeguero', courts: 3 },
    { name: 'Sun Sol Pedro Gonzalez', courts: 2 },
    { name: 'Playa el Agua', courts: 3 },
];

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

// ── CarruselCard ─────────────────────────────────────────────────────────────
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
            <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-padel-primary/20 text-padel-primary' : 'bg-white/8 text-gray-500'}`}>
                    <Radio className="w-3.5 h-3.5" />
                </div>
                <h3 className={`font-black uppercase italic tracking-tight text-sm ${isActive ? 'text-padel-primary' : 'text-gray-400'}`}>Carrusel</h3>
                {isActive && <span className="ml-auto text-[8px] font-black uppercase tracking-widest bg-padel-primary text-black px-2 py-0.5 rounded-full">EN USO</span>}
            </div>

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
                                <p className="text-[9px] text-gray-800 mt-1">Ve a "Agregar de biblioteca" para seleccionar medios</p>
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
            <div className="w-16 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-black">
                {vid
                    ? <><video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Play className="w-3 h-3 text-white" /></div></>
                    : <img src={item.url} alt={item.nombre} className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate">{item.nombre}</p>
                <p className="text-[9px] text-gray-600 truncate">{item.url}</p>
            </div>
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

// ── Animaciones del marcador (lista + agregar desde biblioteca o URL) ─────────
function AnimacionesMarcadorCard({ adData, biblioteca, onNotify }: { adData: any; biblioteca: MediaItem[]; onNotify: (type: 'ok' | 'err', msg: string) => void }) {
    const [nombre, setNombre] = useState('');
    const [url, setUrl] = useState('');
    const [adding, setAdding] = useState(false);
    const list = adData?.animaciones_marcador && typeof adData.animaciones_marcador === 'object' ? Object.entries(adData.animaciones_marcador) as [string, { nombre: string; url: string }][] : [];

    const handleAdd = async (itemUrl?: string) => {
        const u = itemUrl || url.trim();
        const n = nombre.trim() || 'Animación';
        if (!u) return onNotify('err', 'Indica URL o elige de la biblioteca');
        setAdding(true);
        try {
            const id = `anim_${Date.now()}`;
            await setAnimacionMarcador(id, { nombre: n, url: u });
            onNotify('ok', 'Animación añadida. Ya aparece en el marker.');
            setNombre(''); setUrl('');
        } catch (e) { onNotify('err', 'Error al guardar'); }
        finally { setAdding(false); }
    };

    const handleDelete = async (animId: string) => {
        try {
            await setAnimacionMarcador(animId, null);
            onNotify('ok', 'Animación eliminada');
        } catch { onNotify('err', 'Error'); }
    };

    return (
        <Card title="Animaciones del marcador" icon={Sparkles}>
            <p className="text-[10px] text-gray-500 mb-3">El marker dispara estas animaciones con botones debajo de los puntos del game; se ven en la pizarra.</p>
            <div className="space-y-2 mb-3">
                <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre (ej: Celebración)"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600" />
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="URL de imagen/GIF/video"
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600" />
                <div className="flex gap-2">
                    <button onClick={() => handleAdd()} disabled={adding || !url.trim()}
                        className="flex-1 py-2 rounded-lg bg-padel-primary text-black text-[10px] font-black uppercase disabled:opacity-50">Añadir por URL</button>
                    {biblioteca.length > 0 && (
                        <select onChange={e => { const u = e.target.value; if (u) handleAdd(u); e.target.value = ''; }}
                            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white">
                            <option value="">Desde biblioteca...</option>
                            {biblioteca.map(b => <option key={b.id} value={b.url}>{b.nombre}</option>)}
                        </select>
                    )}
                </div>
            </div>
            {list.length > 0 ? (
                <ul className="space-y-1.5">
                    {list.map(([id, a]) => (
                        <li key={id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 border border-white/10">
                            <div className="w-10 h-8 rounded overflow-hidden bg-black shrink-0">
                                {/\.(mp4|webm|gif)(\?|$)/i.test(a.url) ? <video src={a.url} className="w-full h-full object-cover" muted /> : <img src={a.url} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <span className="flex-1 text-[10px] font-bold text-white truncate">{a.nombre || id}</span>
                            <button onClick={() => handleDelete(id)} className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10"><Trash2 className="w-3.5 h-3.5" /></button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-[9px] text-gray-600 py-2">Aún no hay animaciones. Añade una por URL o desde la biblioteca.</p>
            )}
        </Card>
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
export default function AdminCombinedAdsMonitorPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authLoading) return;
        if (!user || !isAdmin) {
            router.replace('/login');
        }
    }, [user, isAdmin, authLoading, router]);

    const [activeTab, setActiveTab] = useState<'ads' | 'monitor' | 'boards'>('ads');
    const [selectedComplex, setSelectedComplex] = useState(COMPLEXES[0]);
    const [searchBoardQuery, setSearchBoardQuery] = useState('');

    // ── ADS STATES ────────────────────────────────────────────────────────────
    const [adData, setAdData] = useState<any>(null);
    const [loadingAd, setLoadingAd] = useState(true);
    const [biblioteca, setBiblioteca] = useState<MediaItem[]>([]);
    const [inputUrl, setInputUrl] = useState('');
    const [inputNombre, setInputNombre] = useState('');
    const [inputTipo, setInputTipo] = useState<MediaType>('imagen');
    const [inputMode, setInputMode] = useState<'url' | 'file'>('url');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fijUrl, setFijUrl] = useState('');
    const [progUrl, setProgUrl] = useState('');
    const [progInicio, setProgInicio] = useState('');
    const [progFin, setProgFin] = useState('');
    const [tickerActivo, setTickerActivo] = useState(false);
    const [tickerTexto, setTickerTexto] = useState('');
    const [tickerVelocidad, setTickerVelocidad] = useState(30);
    const [savingTicker, setSavingTicker] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    // Subsección del módulo Publicidad: principal (biblioteca + ticker) o pizarra (cronómetro, reloj, logos, animaciones)
    const [adsSubSection, setAdsSubSection] = useState<'principal' | 'pizarra'>('principal');

    // ── MONITOR STATES ────────────────────────────────────────────────────────
    const [matches, setMatches] = useState<any[]>([]);
    const [recentFinished, setRecentFinished] = useState<any[]>([]);
    const [loadingMonitor, setLoadingMonitor] = useState(true);
    const [now, setNow] = useState(new Date());
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [chronicle, setChronicle] = useState<{ title: string, text: string } | null>(null);
    const [copiedCourt, setCopiedCourt] = useState<number | null>(null);

    // ── MONITOR LOGIC ─────────────────────────────────────────────────────────
    const calculateProb = (m: any) => {
        const t1Sets = m.sets?.t1 || 0;
        const t2Sets = m.sets?.t2 || 0;
        const t1Games = m.games?.t1 || 0;
        const t2Games = m.games?.t2 || 0;
        const t1Points = m.points?.t1 === 'Adv' ? 50 : parseInt(m.points?.t1) || 0;
        const t2Points = m.points?.t2 === 'Adv' ? 50 : parseInt(m.points?.t2) || 0;

        let base = 50;
        base += (t1Sets - t2Sets) * 15;
        base += (t1Games - t2Games) * 3;
        base += (t1Points - t2Points) * 0.5;

        const finalT1 = Math.min(95, Math.max(5, Math.round(base)));
        return { t1: finalT1, t2: 100 - finalT1 };
    };

    const generateChronicle = async (m: any) => {
        setGeneratingId(m.id);
        try {
            const prompt = `Actúa como un reportero deportivo de pádel de élite. Escribe una crónica épica, emocionante y profesional del siguiente partido finalizado:
            Torneo: ${m.tournamentName}
            Categoría: ${m.category}
            Pareja 1: ${m.t1Name}
            Pareja 2: ${m.t2Name}
            Marcador Final: Sets ${m.sets?.t1 || 0}-${m.sets?.t2 || 0}, Juegos ${m.games?.t1 || 0}-${m.games?.t2 || 0}
            
            Usa un tono heroico, menciona la intensidad en la pista y termina con una felicitación a los ganadores. La crónica debe tener un título llamativo y unos 2-3 párrafos de texto.`;

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
                body: JSON.stringify({ prompt, role: 'reporter' })
            });
            const data = await response.json();
            if (response.status === 429) {
                notify('err', 'Demasiadas peticiones. Espera un minuto e intenta de nuevo.');
                return;
            }
            if (!response.ok) {
                notify('err', data.error || 'Error al generar la crónica');
                return;
            }
            const fullText = data.text || '';
            const lines = fullText.split('\n');
            const title = lines[0].replace(/Title:|Título:/i, '').trim() || "Crónica del Partido";
            const text = lines.slice(1).join('\n').trim() || fullText;

            setChronicle({ title, text });
        } catch (error) {
            console.error("Error generating chronicle:", error);
            notify('err', 'Error al generar la crónica');
        } finally {
            setGeneratingId(null);
        }
    };

    // ── SUBSCRIPTIONS ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAdmin) return;

        // RTDB Publicidad
        const r = dbRef(rtdb, 'publicidad_master');
        const h = (snap: any) => {
            setAdData(snap.val());
            setLoadingAd(false);
        };
        onValue(r, h);

        // Biblioteca
        const rBib = dbRef(rtdb, 'biblioteca_medios');
        const hBib = (snap: any) => {
            const val = snap.val();
            if (val) {
                const items: MediaItem[] = Object.entries(val).map(([id, v]: any) => ({ id, ...v }));
                items.sort((a, b) => b.creadoEn - a.creadoEn);
                setBiblioteca(items);
            } else {
                setBiblioteca([]);
            }
        };
        onValue(rBib, hBib);

        // Firestore Monitor
        const timer = setInterval(() => setNow(new Date()), 1000);
        const qMonitor = fsQuery(collection(db, 'tournaments'));
        const unsubMonitor = onSnapshot(qMonitor, (snapshot) => {
            const allLiveMatches: any[] = [];
            const allRecentFinished: any[] = [];

            snapshot.docs.forEach(docSnap => {
                const tournament = docSnap.data();
                if (tournament.matches) {
                    tournament.matches.forEach((m: any) => {
                        const team1 = m.team1Index > 0 ? tournament.teams?.[m.team1Index - 1] : null;
                        const team2 = m.team2Index > 0 ? tournament.teams?.[m.team2Index - 1] : null;
                        const mData = {
                            ...m,
                            court: m.court || (m.courtIndex !== undefined ? m.courtIndex + 1 : undefined),
                            tournamentName: tournament.name,
                            tournamentId: docSnap.id,
                            category: tournament.category,
                            t1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                            t2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                            startTime: m.actualStartTime
                                ? (typeof m.actualStartTime?.toDate === 'function' ? m.actualStartTime.toDate() : new Date(m.actualStartTime))
                                : new Date(Date.now() - 1000 * 60 * 30)
                        };

                        if (m.status === MatchStatus.LIVE || m.status === 'LIVE' || m.status === 'IN_PROGRESS') {
                            allLiveMatches.push(mData);
                        } else if (m.status === MatchStatus.FINISHED || m.status === 'FINISHED') {
                            allRecentFinished.push(mData);
                        }
                    });
                }
            });

            setMatches(allLiveMatches);
            const toMs = (v: any) => {
                if (!v) return 0;
                if (typeof v?.toDate === 'function') return v.toDate().getTime();
                return new Date(v).getTime();
            };
            setRecentFinished(allRecentFinished.sort((a, b) => toMs(b.endTime) - toMs(a.endTime)).slice(0, 6));
            setLoadingMonitor(false);
        });

        return () => {
            off(r, 'value', h);
            off(rBib, 'value', hBib);
            unsubMonitor();
            clearInterval(timer);
        };
    }, [isAdmin]);

    // Sync formats
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

    // ── ADS HANDLERS ──────────────────────────────────────────────────────────
    const notify = (type: 'ok' | 'err', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

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

    const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) { notify('err', 'Archivo muy grande. Máximo 100 MB.'); return; }
        const path = `publicidad/${Date.now()}_${file.name}`;
        const sRef = storageRef(storage, path);
        const task = uploadBytesResumable(sRef, file);
        setUploadProgress(0);
        task.on('state_changed',
            snap => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            err => notify('err', `Error al subir: ${err.message}`),
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                const item: Omit<MediaItem, 'id'> = {
                    url,
                    tipo: isVideo(file.name) ? 'video' : 'imagen',
                    nombre: inputNombre.trim() || file.name,
                    creadoEn: Date.now(),
                };
                await set(push(dbRef(rtdb, 'biblioteca_medios')), item);
                setPreviewUrl(url); setInputNombre(''); setUploadProgress(null);
                notify('ok', 'Archivo subido y guardado');
            }
        );
    };

    const handleDeleteItem = async (id: string) => {
        await remove(dbRef(rtdb, `biblioteca_medios/${id}`));
        notify('ok', 'Eliminado de biblioteca');
    };

    const handleUsarComoFija = async (url: string) => {
        await set(dbRef(rtdb, 'publicidad_master/fija/url'), url);
        await setModoPublicidad('fija');
        notify('ok', 'Activado como imagen/video fijo');
    };

    const handleUsarEnCarrusel = async (url: string) => {
        const order = (adData?.imagenes ? Object.keys(adData.imagenes).length : 0) + 1;
        await setImagenCarrusel(`img_${Date.now()}`, url, order);
        notify('ok', 'Agregado al carrusel');
    };

    const handleUsarEnCarruselMulti = async (urls: string[]) => {
        const base = adData?.imagenes ? Object.keys(adData.imagenes).length : 0;
        await Promise.all(urls.map((url, i) => setImagenCarrusel(`img_${Date.now()}_${i}`, url, base + i + 1)));
        notify('ok', `${urls.length} elementos agregados`);
    };

    const handleSaveProgramada = async () => {
        if (!progUrl.trim() || !progInicio || !progFin) { notify('err', 'Completa campos'); return; }
        const ini = new Date(progInicio).getTime();
        const fin = new Date(progFin).getTime();
        setSaving(true);
        try {
            await set(dbRef(rtdb, 'publicidad_master/programada'), { url: progUrl.trim(), inicio_unix_ms: ini, fin_unix_ms: fin });
            notify('ok', 'Banner programado guardado');
        } catch { notify('err', 'Error'); } finally { setSaving(false); }
    };

    const carouselItems = adData?.imagenes
        ? Object.entries(adData.imagenes)
            .map(([id, v]: any) => ({ id, ...v }))
            .sort((a, b) => a.orden - b.orden)
        : [];

    if (authLoading || loadingAd) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-padel-primary animate-spin" />
        </div>
    );
    if (!user || !isAdmin) return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-gray-400">
            <RefreshCw className="w-6 h-6 text-padel-primary animate-spin" />
            <p className="text-sm font-medium">Redirigiendo...</p>
        </div>
    );

    return (
        <div className="ipad-screen-container bg-[#080808] text-white relative">
            <Sidebar />

            <div className="ipad-scroll-area p-8 md:p-12 pl-24 md:pl-32 font-outfit">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Atrás
                </Link>

                {/* ── HEADER ── */}
                <header className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-padel-primary/20 rounded-2xl border border-padel-primary/30">
                            {activeTab === 'ads' ? <Megaphone className="w-6 h-6 text-padel-primary" /> : activeTab === 'monitor' ? <Monitor className="w-6 h-6 text-padel-primary" /> : <Layout className="w-6 h-6 text-padel-primary" />}
                        </div>
                        <h4 className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic decoration-2 decoration-padel-primary/30 underline">
                            Módulo de {activeTab === 'ads' ? 'Publicidad' : activeTab === 'monitor' ? 'Central en Vivo' : 'Pizarras'}
                        </h4>
                    </div>

                    <div className="flex justify-between items-end">
                        <div className="flex-1">
                            <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                                {activeTab === 'ads' ? 'GESTIÓN DE' : activeTab === 'monitor' ? 'CENTRAL' : 'MÓDULO DE'} <span className="text-padel-primary">{activeTab === 'ads' ? 'PUBLICIDAD' : activeTab === 'monitor' ? 'EN VIVO' : 'PIZARRAS'}</span>
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                {activeTab === 'ads' ? 'Administra banners, videos y la correa informativa para todas las pantallas.' : activeTab === 'monitor' ? 'Monitoreo en tiempo real y generación de crónicas con IA.' : 'Configuración de marcadores y transmisiones para cada club.'}
                            </p>
                        </div>

                        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 mb-2">
                            <button
                                onClick={() => setActiveTab('ads')}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'ads' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Megaphone className="w-3 h-3" /> Publicidad
                            </button>
                            <button
                                onClick={() => setActiveTab('monitor')}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'monitor' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Monitor className="w-3 h-3" /> Central en Vivo
                            </button>
                            <button
                                onClick={() => setActiveTab('boards')}
                                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'boards' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-gray-500 hover:text-white'}`}
                            >
                                <Layout className="w-3 h-3" /> Pizarras
                            </button>
                        </div>
                    </div>
                </header>

                {/* ── FEEDBACK NOTIFICATION ── */}
                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className={`mb-6 flex items-center gap-3 px-6 py-4 rounded-2xl border text-sm font-black shadow-2xl ${feedback.type === 'ok' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                        >
                            {feedback.type === 'ok' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            {feedback.msg}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {activeTab === 'ads' ? (
                        <motion.div
                            key="ads-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Selector de modo global */}
                            <div className="grid grid-cols-3 gap-3">
                                {(['fija', 'programada', 'carrusel'] as Modo[]).map(m => (
                                    <button key={m}
                                        onClick={() => setModoPublicidad(m)}
                                        className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${adData?.modo === m ? 'border-padel-primary bg-padel-primary/10 text-padel-primary shadow-lg shadow-padel-primary/5' : 'border-white/8 text-gray-600 hover:border-white/20'}`}
                                    >
                                        {m === 'fija' && <ImageIcon className="w-5 h-5" />}
                                        {m === 'programada' && <Clock className="w-5 h-5" />}
                                        {m === 'carrusel' && <Radio className="w-5 h-5" />}
                                        <span className="text-[10px] font-black uppercase tracking-widest">{m}</span>
                                        {adData?.modo === m && <motion.span layoutId="active-dot" className="w-2 h-2 rounded-full bg-padel-primary shadow-[0_0_10px_rgba(204,255,0,0.5)]" />}
                                    </button>
                                ))}
                            </div>

                            {/* Subsección: Biblioteca/Ticker vs Pizarra (cronómetro, reloj, logos, animaciones) */}
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                                <button
                                    onClick={() => setAdsSubSection('principal')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${adsSubSection === 'principal' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    Biblioteca · Ticker
                                </button>
                                <button
                                    onClick={() => setAdsSubSection('pizarra')}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${adsSubSection === 'pizarra' ? 'bg-padel-primary text-black' : 'text-gray-500 hover:text-white'}`}
                                >
                                    <Monitor className="w-3.5 h-3.5" /> Pizarra
                                </button>
                            </div>

                            {adsSubSection === 'pizarra' ? (
                                <div className="space-y-6">
                                    {/* ── Cronómetro (duración del partido, centro pizarra) ── */}
                                    <Card title="Cronómetro (duración del partido)" icon={Timer}>
                                        <p className="text-[10px] text-gray-500 mb-3">Estilo del cronómetro que aparece en el centro de la pizarra.</p>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {(['default', 'minimal', 'broadcast', 'digital'] as CronometroTipo[]).map(t => (
                                                <button
                                                    key={t}
                                                    onClick={async () => { await setCronometroTipo(t); notify('ok', 'Cronómetro actualizado'); }}
                                                    className={`py-3 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${adData?.cronometro_tipo === t ? 'border-padel-primary bg-padel-primary/10 text-padel-primary' : 'border-white/10 text-gray-500 hover:border-white/20'}`}
                                                >
                                                    {t === 'default' && 'Clásico'}
                                                    {t === 'minimal' && 'Minimal'}
                                                    {t === 'broadcast' && 'Broadcast'}
                                                    {t === 'digital' && 'Digital'}
                                                </button>
                                            ))}
                                        </div>
                                    </Card>
                                    {/* ── Reloj (hora del día) ── */}
                                    <Card title="Reloj (hora del día)" icon={Clock}>
                                        <p className="text-[10px] text-gray-500 mb-3">Tipo de reloj y modelos con imagen/fondo. Carga archivos o URLs y define tiempo de rotación.</p>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-[10px] font-black uppercase text-gray-500 block mb-1">Tipo</span>
                                                <div className="flex gap-2 flex-wrap">
                                                    {(['default', 'broadcast', 'custom'] as RelojTipo[]).map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={async () => { await setRelojTipo(t); notify('ok', 'Reloj actualizado'); }}
                                                            className={`py-2 px-3 rounded-lg border text-[10px] font-black uppercase ${adData?.reloj_tipo === t || adData?.reloj_ocasion === t ? 'border-padel-primary bg-padel-primary/10 text-padel-primary' : 'border-white/10 text-gray-500'}`}
                                                        >
                                                            {t === 'default' && 'Por defecto'}
                                                            {t === 'broadcast' && 'Broadcast'}
                                                            {t === 'custom' && 'Personalizado'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-600">Los modelos personalizados se configuran con imagen de fondo en el torneo (broadcastingSettings.clockImageUrl).</p>
                                        </div>
                                    </Card>
                                    {/* ── Logo evento, Patrocinantes, Video (esquina superior izquierda) ── */}
                                    <Card title="Logo del evento y patrocinantes (esquina superior izquierda)" icon={ImagePlus}>
                                        <p className="text-[10px] text-gray-500 mb-3">Sube logos o URLs. Cada bloque tiene su lista y tiempo de rotación (segundos).</p>
                                        <p className="text-[9px] text-gray-600">Usa la Biblioteca arriba para subir imágenes; luego asígnalas a Logo evento o Patrocinantes desde la biblioteca o desde el torneo.</p>
                                    </Card>
                                    {/* ── Ticker (tira inferior) con texto y animaciones ── */}
                                    <Card title="Tira informativa inferior (texto y animaciones)" icon={Type}>
                                        <p className="text-[10px] text-gray-500 mb-3">Además del texto, puedes activar animaciones de caracteres. Las animaciones se cargan en Biblioteca y se asignan al ticker.</p>
                                        <p className="text-[9px] text-gray-600">El tipo de ticker (solo texto / con animaciones) y la velocidad se configuran en la pestaña Biblioteca · Ticker.</p>
                                    </Card>
                                    {/* ── Animaciones del marcador ── */}
                                    <AnimacionesMarcadorCard adData={adData} biblioteca={biblioteca} onNotify={notify} />
                                </div>
                            ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <Card title="Agregar a Biblioteca" icon={BookImage}>
                                        <div className="flex gap-1 bg-black/40 rounded-xl p-0.5 border border-white/10 mb-2">
                                            {(['url', 'file'] as const).map(m => (
                                                <button key={m} onClick={() => setInputMode(m)}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${inputMode === m ? 'bg-white/10 text-white' : 'text-gray-600 hover:text-gray-400'}`}>
                                                    {m === 'url' ? <><LinkIcon className="w-3 h-3" /> URL</> : <><Upload className="w-3 h-3" /> Archivo</>}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            value={inputNombre} onChange={e => setInputNombre(e.target.value)}
                                            placeholder="Nombre del cliente o campaña"
                                            className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40"
                                        />
                                        {inputMode === 'url' ? (
                                            <div className="space-y-3">
                                                <input
                                                    value={inputUrl} onChange={e => { setInputUrl(e.target.value); setPreviewUrl(e.target.value); }}
                                                    placeholder="URL de imagen o video (mp4)"
                                                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40"
                                                />
                                                {previewUrl && <MediaPreview url={previewUrl} label="Vista Previa" />}
                                                <button onClick={handleSaveUrl}
                                                    className="w-full bg-padel-primary text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] transition-transform">
                                                    Guardar en biblioteca
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <button onClick={() => fileInputRef.current?.click()}
                                                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-white/10 rounded-2xl py-8 text-xs font-black uppercase tracking-widest text-gray-600 hover:border-padel-primary/40 hover:text-padel-primary transition-colors bg-white/5">
                                                    <Upload className="w-5 h-5" /> Seleccionar Archivo
                                                </button>
                                                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUploadFile} />
                                                {uploadProgress !== null && (
                                                    <div className="space-y-1">
                                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                            <motion.div className="h-full bg-padel-primary" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 text-center font-black">{uploadProgress}%</p>
                                                    </div>
                                                )}
                                                {previewUrl && <MediaPreview url={previewUrl} label="Subido" />}
                                            </div>
                                        )}
                                    </Card>

                                    <Card title="Correa Informativa (Ticker)" icon={MessageSquare} active={tickerActivo}>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/10">
                                                <div>
                                                    <p className="font-black uppercase text-[10px] tracking-widest text-white">Estado</p>
                                                    <p className="text-[9px] text-gray-600 mt-0.5">Muestra noticias o anuncios en la zona inferior.</p>
                                                </div>
                                                <button onClick={() => setTickerActivo(v => !v)}>
                                                    {tickerActivo ? <ToggleRight className="w-10 h-10 text-padel-primary" /> : <ToggleLeft className="w-10 h-10 text-gray-700" />}
                                                </button>
                                            </div>
                                            <textarea
                                                value={tickerTexto} onChange={e => setTickerTexto(e.target.value)}
                                                placeholder="Ej: Bienvenidos al Torneo Verano · Sigue los partidos en vivo · @smartpadel"
                                                rows={3}
                                                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-padel-primary/40 resize-none font-medium"
                                            />
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Velocidad</span>
                                                    <span className="text-xs font-black text-padel-primary">{tickerVelocidad}s</span>
                                                </div>
                                                <input type="range" min={10} max={90} step={5} value={tickerVelocidad} onChange={e => setTickerVelocidad(Number(e.target.value))} className="w-full accent-padel-primary" />
                                            </div>
                                            <button onClick={async () => {
                                                setSavingTicker(true);
                                                try {
                                                    await setTickerConfig(tickerActivo, tickerTexto.trim(), tickerVelocidad);
                                                    notify('ok', 'Configuración de correa guardada');
                                                } catch { notify('err', 'Error'); } finally { setSavingTicker(false); }
                                            }} className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                                                {savingTicker ? 'Guardando...' : 'Aplicar configuración'}
                                            </button>
                                        </div>
                                    </Card>
                                </div>

                                <div className="space-y-6">
                                    <div className="glass p-6 rounded-[2.5rem] border border-white/5 flex flex-col h-full max-h-[1000px]">
                                        <div className="flex items-center gap-3 mb-6">
                                            <Film className="w-5 h-5 text-padel-primary" />
                                            <h3 className="font-black uppercase italic tracking-tight text-lg text-white">Biblioteca ({biblioteca.length})</h3>
                                        </div>
                                        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                                            {biblioteca.length === 0 ? (
                                                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                    <p className="text-gray-700 text-xs font-black uppercase tracking-widest">Biblioteca vacía</p>
                                                </div>
                                            ) : biblioteca.map(item => (
                                                <MediaRow
                                                    key={item.id}
                                                    item={item}
                                                    onUsarFija={() => handleUsarComoFija(item.url)}
                                                    onUsarCarrusel={() => handleUsarEnCarrusel(item.url)}
                                                    onDelete={() => handleDeleteItem(item.id)}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <CarruselCard
                                        adData={adData}
                                        carouselItems={carouselItems}
                                        biblioteca={biblioteca}
                                        onToggle={toggleCarrusel}
                                        onDelete={deleteImagenCarrusel}
                                        onAddItems={handleUsarEnCarruselMulti}
                                    />
                                </div>
                            </div>
                            )}
                        </motion.div>
                    ) : activeTab === 'monitor' ? (
                        <motion.div
                            key="monitor-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-8"
                        >
                            {/* MONITOR Grid */}
                            {matches.length === 0 ? (
                                <div className="h-[40vh] glass border-dashed border-2 border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                                    <Radio className="w-12 h-12 text-gray-800 mb-4 animate-pulse" />
                                    <h2 className="text-2xl font-black italic uppercase text-gray-600">No hay transmisiones activas</h2>
                                    <p className="text-gray-700 text-sm mt-2">Inicia un partido para visualizar la pizarra aquí.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    {matches.map((m) => {
                                        const diff = Math.max(0, now.getTime() - m.startTime.getTime());
                                        const mm = Math.floor(diff / 60000);
                                        const ss = Math.floor((diff % 60000) / 1000);
                                        const duration = `${mm}:${ss.toString().padStart(2, '0')}`;

                                        return (
                                            <div key={`${m.tournamentId}-${m.id}`} className="flex flex-col gap-4 group">
                                                <div className="flex justify-between items-end px-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-gray-500">{m.tournamentName}</span>
                                                        </div>
                                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">PISTA {m.court}</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-1.5 text-padel-primary">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                <span className="text-sm font-black tabular-nums">{duration}</span>
                                                            </div>
                                                            <span className="text-[9px] font-bold text-gray-600 uppercase">En Vivo</span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    const url = `${window.location.host}/display/court/${m.court}`;
                                                                    navigator.clipboard.writeText(url);
                                                                    setCopiedCourt(m.court);
                                                                    setTimeout(() => setCopiedCourt(null), 2000);
                                                                }}
                                                                className="px-4 py-2 bg-white/5 hover:bg-padel-primary hover:text-black rounded-xl border border-white/10 transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2"
                                                            >
                                                                {copiedCourt === m.court ? <Check className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                                                {copiedCourt === m.court ? 'Copiado' : `Enlace TV ${m.court}`}
                                                            </button>
                                                            <Link
                                                                href={`/tournaments/${m.tournamentId}/display/${m.id}`} target="_blank"
                                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all"
                                                            >
                                                                <Maximize2 className="w-5 h-5" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden border-4 border-white/5 bg-black shadow-2xl transition-all hover:border-padel-primary/30">
                                                    <iframe
                                                        src={`/tournaments/${m.tournamentId}/display/${m.id}`}
                                                        className="w-[200%] h-[200%] origin-top-left pointer-events-none scale-50 border-none"
                                                        title={`Cancha ${m.court}`}
                                                    />

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-md">
                                                        <div className="bg-black/80 p-6 rounded-[2.5rem] border border-white/10 text-center transform scale-90 group-hover:scale-100 transition-transform w-[80%]">
                                                            <p className="text-white font-black italic uppercase text-xl mb-4 leading-tight">{m.t1Name} vs {m.t2Name}</p>
                                                            <div className="flex justify-center gap-4">
                                                                <div className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-center">
                                                                    <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">AI Chance</p>
                                                                    <p className="text-lg font-black text-white">{calculateProb(m).t1}% / {calculateProb(m).t2}%</p>
                                                                </div>
                                                                <div className="px-5 py-3 bg-padel-primary rounded-2xl text-center">
                                                                    <p className="text-[8px] font-bold text-black/60 uppercase mb-1">Marcador</p>
                                                                    <p className="text-lg font-black text-black">{m.points?.t1 || '0'}:{m.points?.t2 || '0'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* IA Reporter Section */}
                            <section className="pt-8 border-t border-white/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <Megaphone className="w-5 h-5 text-orange-400" />
                                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">CRÓNICAS <span className="text-orange-400">DE IA REPORTER</span></h2>
                                </div>

                                {recentFinished.length === 0 ? (
                                    <div className="p-12 glass border-dashed border border-white/5 rounded-[2.5rem] text-center text-gray-600 font-bold uppercase text-xs italic">
                                        No hay partidos finalizados recientemente para reportar
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recentFinished.map((m) => (
                                            <div key={m.id} className="glass p-6 rounded-[2.5rem] border border-white/5 hover:border-orange-400/20 transition-all flex flex-col justify-between h-56">
                                                <div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-gray-500">{m.category}</span>
                                                        <span className="text-[9px] font-bold text-gray-700">{m.tournamentName}</span>
                                                    </div>
                                                    <h4 className="text-white font-black italic uppercase text-md leading-tight mb-2 truncate">{m.t1Name} vs {m.t2Name}</h4>
                                                    <div className="flex items-center gap-2 text-orange-400">
                                                        <Trophy className="w-3 h-3" />
                                                        <span className="text-[10px] font-black italic">FINALIZADO • {m.sets?.t1 || 0}-{m.sets?.t2 || 0}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => generateChronicle(m)}
                                                    disabled={generatingId === m.id}
                                                    className="w-full py-3 bg-white/5 hover:bg-orange-400 hover:text-black rounded-xl border border-white/10 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {generatingId === m.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                                    {generatingId === m.id ? 'Escribiendo...' : 'Generar Crónica IA'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* IA Chronicle Modal */}
                            <AnimatePresence>
                                {chronicle && (
                                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-2xl">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                            className="max-w-2xl w-full bg-[#0d0d0d] border-2 border-orange-400/20 rounded-[3rem] p-10 relative overflow-hidden"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setChronicle(null)}
                                                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white rounded-full hover:bg-white/10 transition-all z-10"
                                                aria-label="Cerrar"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-50" />
                                            <div className="flex items-center gap-2 mb-6">
                                                <Megaphone className="w-5 h-5 text-orange-400" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400/60">Crónica Generada por Smart Reporter</span>
                                            </div>
                                            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight underline decoration-orange-400/30 decoration-4">{chronicle.title}</h1>
                                            <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                                <p className="text-gray-400 font-medium text-lg leading-relaxed whitespace-pre-wrap">{chronicle.text}</p>
                                            </div>
                                            <div className="mt-10 flex gap-4">
                                                <button onClick={() => {
                                                    const text = `🏆 *${chronicle.title}*\n\n${chronicle.text}\n\n_Generado por Smart Padel Pro_`;
                                                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                                }} className="flex-1 py-4 bg-[#25D366] text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl shadow-green-500/10">Compartir en WhatsApp</button>
                                                <button onClick={() => setChronicle(null)} className="px-8 py-4 bg-white/5 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Cerrar</button>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="boards-tab"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                {/* Sidebar de Complejos */}
                                <div className="xl:col-span-4 space-y-6">
                                    <div className="glass p-6 rounded-[2.5rem] border border-white/5 bg-white/[0.02]">
                                        <div className="flex items-center gap-3 mb-6 px-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <h3 className="text-sm font-black uppercase tracking-widest italic text-gray-400">Seleccionar Complejo</h3>
                                        </div>

                                        <div className="relative mb-6">
                                            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                            <input
                                                type="text"
                                                placeholder="BUSCAR CLUB..."
                                                value={searchBoardQuery}
                                                onChange={(e) => setSearchBoardQuery(e.target.value)}
                                                className="w-full bg-black border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs font-bold uppercase tracking-widest outline-none focus:border-padel-primary/50 transition-all placeholder:text-gray-800"
                                            />
                                        </div>

                                        <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                                            {COMPLEXES.filter(c => c.name.toLowerCase().includes(searchBoardQuery.toLowerCase())).map((c) => (
                                                <button
                                                    key={c.name}
                                                    onClick={() => setSelectedComplex(c)}
                                                    className={`w-full p-4 rounded-xl text-left transition-all border flex items-center justify-between group ${selectedComplex.name === c.name
                                                        ? 'bg-padel-primary/10 border-padel-primary text-padel-primary'
                                                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black uppercase italic tracking-tight">{c.name}</span>
                                                        <span className="text-[9px] font-bold opacity-60 uppercase">{c.courts} CANCHAS</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 transition-transform translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pizarra YouTube */}
                                    <div className="glass p-6 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-red-600/10 to-transparent">
                                        <div className="flex items-center gap-3 mb-6 px-2">
                                            <Youtube className="w-5 h-5 text-red-500" />
                                            <h3 className="text-sm font-black uppercase tracking-widest italic text-white/80">YouTube Broadcast</h3>
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6 px-2 leading-relaxed">
                                            Genera una pizarra optimizada para transmisiones en vivo con overlay transparente.
                                        </p>
                                        <Link
                                            href={`/admin/boards/youtube?complex=${encodeURIComponent(selectedComplex.name)}`}
                                            target="_blank"
                                            className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:scale-95"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            Abrir Pizarra YouTube
                                        </Link>
                                    </div>
                                </div>

                                {/* Grid de Pizarras por Cancha */}
                                <div className="xl:col-span-8">
                                    <div className="flex items-center justify-between mb-8 px-4">
                                        <div>
                                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                                                {selectedComplex.name} <span className="text-padel-primary">DIRECTO</span>
                                            </h2>
                                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Sincronización en tiempo real • 4K Display Ready</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-padel-primary animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-padel-primary/60 italic">Signal Active</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                        {Array.from({ length: selectedComplex.courts }).map((_, i) => (
                                            <div key={i} className="glass p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between hover:border-padel-primary/20 transition-all group min-h-[220px]">
                                                <div className="flex items-start justify-between mb-8">
                                                    <div className="w-14 h-14 rounded-[1.25rem] bg-padel-primary/10 border border-padel-primary/20 flex items-center justify-center text-padel-primary group-hover:bg-padel-primary group-hover:text-black transition-all duration-500">
                                                        <Monitor className="w-7 h-7" />
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">COURT UNIT</span>
                                                        <h4 className="text-4xl font-black italic uppercase tracking-tighter">C-{i + 1}</h4>
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/tv?cancha=${i + 1}&complex=${encodeURIComponent(selectedComplex.name)}`}
                                                    target="_blank"
                                                    className="w-full flex items-center justify-between p-5 bg-white/5 rounded-[1.5rem] border border-white/10 hover:bg-white/10 group-hover:border-padel-primary/30 transition-all"
                                                >
                                                    <span className="text-xs font-black uppercase tracking-widest italic">Vincular Pizarra</span>
                                                    <ExternalLink className="w-4 h-4 text-padel-primary" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx global>{`
                .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(204, 255, 0, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(204, 255, 0, 0.2); }
            `}</style>
        </div>
    );
}
