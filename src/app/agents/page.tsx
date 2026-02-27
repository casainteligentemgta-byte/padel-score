'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Target, ArrowRight, Bot, Activity, DollarSign, Zap,
    Palette, Send, Calendar, Shield, BarChart3, Play,
    X as CloseIcon, Brain, BookOpen, Plus, Trash2, Edit3, Search,
    Filter, CheckCircle2, XCircle, Save, Loader2, Database,
    FolderOpen, Tag, Link2, Eye, EyeOff, RefreshCw, ChevronDown,
    FileText, LayoutGrid, AlertTriangle, Info, Terminal
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import { getAuthHeaders } from '@/lib/apiAuth';
import { dataService } from '@/lib/dataService';
import { systemMonitor } from '@/lib/systemMonitor';
import {
    getAllKnowledgeDocs,
    addKnowledgeDoc,
    updateKnowledgeDoc,
    deleteKnowledgeDoc,
    KNOWLEDGE_CATEGORIES,
    KnowledgeDocument,
} from '@/lib/ragService';

// ── Components for Knowledge Base ───────────────────────────────────────────

interface DocFormProps {
    initial?: KnowledgeDocument;
    onSave: (data: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    onCancel: () => void;
    saving: boolean;
}

function DocForm({ initial, onSave, onCancel, saving }: DocFormProps) {
    const [title, setTitle] = useState(initial?.title || '');
    const [content, setContent] = useState(initial?.content || '');
    const [category, setCategory] = useState<KnowledgeDocument['category']>(initial?.category || 'other');
    const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') || '');
    const [source, setSource] = useState(initial?.source || '');
    const [isActive, setIsActive] = useState(initial?.isActive ?? true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tags = tagsInput
            .split(',')
            .map(t => t.trim().toLowerCase())
            .filter(t => t.length > 0);
        await onSave({ title, content, category, tags, source, isActive });
    };

    const cat = KNOWLEDGE_CATEGORIES.find(c => c.value === category);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Título del Documento</label>
                <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    placeholder="Ej: Regla del Saque en Pádel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50 focus:bg-white/8"
                />
            </div>

            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Categoría</label>
                <div className="flex flex-wrap gap-2">
                    {KNOWLEDGE_CATEGORIES.map(c => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => setCategory(c.value)}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all
                                ${category === c.value
                                    ? `${c.color} border-current`
                                    : 'bg-white/[0.03] text-gray-600 border-white/5 hover:bg-white/[0.06]'
                                }`}
                        >
                            <span>{c.emoji}</span> {c.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                    Contenido <span className="text-gray-700 normal-case">({content.length} chars)</span>
                </label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    rows={10}
                    placeholder="Pega aquí el texto del reglamento, noticia, artículo estratégico..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50 resize-y font-mono leading-relaxed"
                />
            </div>

            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Tags</label>
                <input
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="saque, falta, servicio..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50"
                />
            </div>

            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Fuente</label>
                <input
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="URL o descripción"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50"
                />
            </div>

            <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <span className="text-xs font-black text-white uppercase">Documento Activo</span>
                <button
                    type="button"
                    onClick={() => setIsActive(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-padel-primary' : 'bg-white/10'}`}
                >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
            </div>

            <div className="flex gap-3 pt-2">
                <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-400">Cancelar</button>
                <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-padel-primary text-black flex items-center justify-center gap-2">
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}

function DocCard({ doc, onEdit, onToggle, onDelete }: { doc: KnowledgeDocument; onEdit: () => void; onToggle: () => void; onDelete: () => void; }) {
    const [expanded, setExpanded] = useState(false);
    const cat = KNOWLEDGE_CATEGORIES.find(c => c.value === doc.category);

    return (
        <motion.div layout className={`rounded-2xl border transition-all ${doc.isActive ? 'border-white/[0.08] bg-white/[0.02]' : 'border-white/[0.04] bg-white/[0.01] opacity-50'}`}>
            <div className="flex items-start gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${cat?.color || 'bg-white/5 text-gray-400'}`}>
                    {cat?.emoji || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-xs font-black italic uppercase tracking-tight text-white leading-tight line-clamp-2">{doc.title}</h3>
                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${doc.isActive ? 'bg-padel-primary/20 text-padel-primary' : 'bg-white/5 text-gray-600'}`}>{doc.isActive ? 'Activo' : 'Inactivo'}</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-3 border-t border-white/[0.04]">
                        <pre className="text-[10px] text-gray-500 leading-relaxed whitespace-pre-wrap mt-3 max-h-48 overflow-y-auto font-mono">{doc.content}</pre>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex border-t border-white/[0.04]">
                <button onClick={() => setExpanded(!expanded)} className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase text-gray-600 hover:text-gray-400">{expanded ? 'Ocultar' : 'Ver'}</button>
                <button onClick={onToggle} className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase text-gray-600 hover:text-yellow-400 border-x border-white/[0.04]">{doc.isActive ? 'Off' : 'On'}</button>
                <button onClick={onEdit} className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase text-gray-600 hover:text-padel-primary border-r border-white/[0.04]"><Edit3 className="w-3 h-3" /> Editar</button>
                <button onClick={onDelete} className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase text-gray-600 hover:text-red-400"><Trash2 className="w-3 h-3" /> Borrar</button>
            </div>
        </motion.div>
    );
}

// ── Main Page Component ─────────────────────────────────────────────────────

export default function AgentCenter() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<'agents' | 'knowledge' | 'logs'>('agents');

    // Agent State
    const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingAgent, setIsLoadingAgent] = useState(false);
    const [contextData, setContextData] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Knowledge State
    const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [savingDoc, setSavingDoc] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showDocForm, setShowDocForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    // Load Data
    useEffect(() => {
        if (activeTab === 'knowledge') {
            loadDocs();
        } else if (activeTab === 'logs') {
            loadLogs();
        }
    }, [activeTab]);

    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const loadLogs = async () => {
        setLoadingLogs(true);
        try {
            const data = await systemMonitor.getRecentLogs(100);
            setLogs(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingLogs(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoadingAgent]);

    useEffect(() => {
        const loadContext = async () => {
            if (!user) return;
            try {
                const [tournaments, expenses, participants] = await Promise.all([
                    dataService.getMyTournaments(user.uid),
                    dataService.getMyExpenses(user.uid),
                    dataService.getMyParticipants(user.uid)
                ]);
                setContextData({
                    tournaments,
                    expenses,
                    participants,
                    totalTournaments: tournaments.length,
                    totalExpenses: expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0),
                    totalPlayers: participants.length
                });
            } catch (error) {
                console.error("Error loading agent context:", error);
            }
        };
        loadContext();
    }, [user]);

    const loadDocs = async () => {
        setLoadingDocs(true);
        try {
            const data = await getAllKnowledgeDocs();
            setDocs(data);
        } catch (e) {
            console.error(e);
            showToast('Error cargando documentos', 'err');
        } finally {
            setLoadingDocs(false);
        }
    };

    const showToast = (msg: string, type: 'ok' | 'err') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedAgent || isLoadingAgent) return;
        const userMessage = { role: 'user', content: message, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoadingAgent(true);
        try {
            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
                body: JSON.stringify({ agentId: selectedAgent.id, message: userMessage.content, context: contextData })
            });
            const data = await response.json();
            if (response.status === 429) {
                setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Demasiadas peticiones. Espera un minuto e intenta de nuevo.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                return;
            }
            if (!response.ok) {
                setMessages(prev => [...prev, { role: 'assistant', content: `❌ ${data.error || 'Error de comunicación.'}`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
                return;
            }
            setMessages(prev => [...prev, { role: 'assistant', content: data.content || 'Respuesta vacía.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error de comunicación.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
        } finally {
            setIsLoadingAgent(false);
        }
    };

    const handleSaveDoc = async (data: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
        setSavingDoc(true);
        try {
            if (editingDoc?.id) {
                await updateKnowledgeDoc(editingDoc.id, data);
                showToast('Documento actualizado ✓', 'ok');
            } else {
                await addKnowledgeDoc(data);
                showToast('Documento añadido ✓', 'ok');
            }
            setShowDocForm(false);
            setEditingDoc(null);
            await loadDocs();
        } catch (e) {
            showToast('Error guardando', 'err');
        } finally {
            setSavingDoc(false);
        }
    };

    const handleDeleteDoc = async (id: string) => {
        if (!confirm('¿Eliminar?')) return;
        try {
            await deleteKnowledgeDoc(id);
            showToast('Eliminado', 'ok');
            await loadDocs();
        } catch (e) { showToast('Error', 'err'); }
    };

    const handleToggleDoc = async (d: KnowledgeDocument) => {
        if (!d.id) return;
        try {
            await updateKnowledgeDoc(d.id, { isActive: !d.isActive });
            await loadDocs();
        } catch (e) { console.error(e); }
    };

    const filteredDocs = docs.filter(d => {
        const matchCat = filterCategory === 'all' || d.category === filterCategory;
        const matchSearch = !searchQuery || [d.title, d.content].some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchCat && matchSearch;
    });

    const agents = [
        { id: 'safeguard', name: 'SafeGuard Pro', role: 'Seguridad & Analista', description: 'Protección antihack y análisis de integridad de datos. Detecta anomalías y optimiza la base de datos.', icon: Shield, color: 'from-blue-600 to-cyan-400', glow: 'rgba(37, 99, 235, 0.5)', stats: ['Activo', '100%', 'Pro'], action: 'Auditar' },
        { id: 'media', name: 'Media Master', role: 'Prensa & Creador', description: 'Narrador deportivo y creador de contenido viral. Genera guiones para TikTok y crónicas de prensa.', icon: Play, color: 'from-red-500 to-pink-500', glow: 'rgba(239, 68, 68, 0.5)', stats: ['AI Scrt', 'Alta', '5 Plat'], action: 'Crear' },
        { id: 'stats', name: 'Stats Guru', role: 'Estadísticas Pro', description: 'Deep dive en métricas de juego, rankings y rendimiento histórico. Predicciones basadas en Big Data.', icon: BarChart3, color: 'from-padel-primary to-green-600', glow: 'rgba(204, 255, 0, 0.5)', stats: ['94%', 'Live', 'BigD'], action: 'Ver Stats' },
        { id: 'organizer', name: 'Padel Organizer', role: 'Logística & Fixtures', description: 'Experto en formatos: Americanos, Round Robin y Eliminatorias. Optimiza tiempos y pistas.', icon: Calendar, color: 'from-orange-400 to-red-600', glow: 'rgba(251, 146, 60, 0.5)', stats: ['4 Form', 'Pro', 'Alta'], action: 'Planificar' },
        { id: 'midas', name: 'Agente Midas', role: 'Finanzas & ROI', description: 'Analiza la rentabilidad bruta y neta de tus torneos. Gestión de gastos y proyecciones financieras.', icon: DollarSign, color: 'from-amber-400 to-orange-600', glow: 'rgba(251, 191, 36, 0.5)', stats: ['ROI', 'Monitor', 'Utility'], action: 'Analizar' },
        { id: 'aura', name: 'Aura Design', role: 'UX/UI & Aesthetics', description: 'Especialista en interfaces futuristas. Asegura que el club sea premium y ergonómico.', icon: Palette, color: 'from-fuchsia-400 to-purple-600', glow: 'rgba(192, 38, 211, 0.5)', stats: ['10/10', 'Sci-Fi', 'NextGen'], action: 'Auditar' }
    ];

    return (
        <div className="ipad-screen-container bg-[#050505] text-white relative flex overflow-hidden">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-20 md:pl-24">
                {/* Header Superior con Tabs */}
                <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-padel-primary/10 rounded-xl border border-padel-primary/20">
                            <Sparkles className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black italic uppercase tracking-tighter leading-none">IA Hub</h1>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Inteligencia Artificial Pro</p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setActiveTab('agents')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'agents' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" /> Explorar Agentes
                        </button>
                        <button
                            onClick={() => setActiveTab('knowledge')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'knowledge' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Brain className="w-3.5 h-3.5" /> Base Conocimiento
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'logs' ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Shield className="w-3.5 h-3.5" /> Vigilancia Logs
                        </button>
                    </div>

                    {activeTab === 'knowledge' && isAdmin && (
                        <button onClick={() => { setEditingDoc(null); setShowDocForm(true); }} className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase rounded-xl tracking-widest flex items-center gap-2 hover:bg-gray-200 transition-all">
                            <Plus className="w-3.5 h-3.5" /> Nuevo Doc
                        </button>
                    )}
                </header>

                {/* Área de Scrolleo */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    <AnimatePresence mode="wait">
                        {activeTab === 'agents' ? (
                            <motion.div
                                key="agents"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 md:p-10"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {agents.map((agent, index) => (
                                        <motion.div
                                            key={agent.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => { setSelectedAgent(agent); setMessages([{ role: 'assistant', content: `Hola! Soy ${agent.name}. ¿Qué necesitas?`, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); }}
                                            className="glass p-6 rounded-[2rem] border border-white/5 hover:border-padel-primary/30 transition-all cursor-pointer group relative overflow-hidden"
                                        >
                                            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${agent.color} opacity-10 blur-2xl group-hover:opacity-20 transition-all`} />
                                            <div className={`p-3 w-12 h-12 rounded-xl bg-gradient-to-br ${agent.color} mb-6 shadow-lg`}><agent.icon className="w-6 h-6 text-white" /></div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white mb-1">{agent.name}</h3>
                                            <p className="text-padel-primary font-black uppercase text-[9px] tracking-widest mb-3 italic">{agent.role}</p>
                                            <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6 italic">{agent.description}</p>
                                            <div className="flex gap-2">
                                                {agent.stats.map(s => <span key={s} className="bg-white/5 px-2 py-1 rounded text-[8px] font-black text-gray-600 uppercase tracking-tighter">{s}</span>)}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : activeTab === 'knowledge' ? (
                            <motion.div
                                key="knowledge"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 md:p-10"
                            >
                                {/* Knowledge Search/Filters */}
                                <div className="flex flex-col md:flex-row gap-4 mb-8">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                                        <input
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            placeholder="Buscar en conocimiento..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-padel-primary/40"
                                        />
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                        <button onClick={() => setFilterCategory('all')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${filterCategory === 'all' ? 'bg-white text-black' : 'text-gray-500 bg-white/5 hover:text-white'}`}>Todos</button>
                                        {KNOWLEDGE_CATEGORIES.map(c => (
                                            <button key={c.value} onClick={() => setFilterCategory(c.value)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${filterCategory === c.value ? `${c.color} border border-current` : 'text-gray-500 bg-white/5 hover:text-white'}`}>
                                                {c.emoji} {c.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {loadingDocs ? (
                                    <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-padel-primary" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {filteredDocs.map(d => (
                                            <DocCard key={d.id} doc={d} onEdit={() => { setEditingDoc(d); setShowDocForm(true); }} onToggle={() => handleToggleDoc(d)} onDelete={() => d.id && handleDeleteDoc(d.id)} />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-6 md:p-10"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    <div className="glass p-6 rounded-3xl border border-white/5">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-padel-primary/10 flex items-center justify-center text-padel-primary">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Sistema</span>
                                        </div>
                                        <p className="text-xl font-black italic uppercase tracking-tighter">Status <span className="text-padel-primary">OK</span></p>
                                    </div>
                                    <div className="glass p-6 rounded-3xl border border-white/5">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Seguridad</span>
                                        </div>
                                        <p className="text-xl font-black italic uppercase tracking-tighter">Accesos <span className="text-blue-400">OK</span></p>
                                    </div>
                                    <button onClick={loadLogs} className="glass p-6 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all">
                                        <RefreshCw className={`w-5 h-5 text-padel-primary ${loadingLogs ? 'animate-spin' : ''}`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Refrescar Logs</span>
                                    </button>
                                </div>

                                <div className="glass rounded-3xl border border-white/5 overflow-hidden divide-y divide-white/5">
                                    {logs.length === 0 ? (
                                        <div className="py-20 text-center text-gray-700 italic text-xs font-bold uppercase tracking-widest">Console offline or no logs...</div>
                                    ) : (
                                        logs.map((log, idx) => (
                                            <div key={log.id || idx} className="p-4 hover:bg-white/[0.02] transition-colors flex items-start gap-4">
                                                <div className={`mt-1 p-2 rounded-lg border ${log.level === 'CRITICAL' || log.level === 'ERROR' ? 'text-red-500 bg-red-500/10 border-red-500/20' : log.level === 'WARNING' ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/10'}`}>
                                                    {log.level === 'CRITICAL' || log.level === 'ERROR' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-padel-primary">{log.module}</span>
                                                        <span className="text-[9px] text-gray-600 font-bold italic">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-xs font-medium text-gray-300 leading-relaxed font-mono">{log.message}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Modals & Dialogs */}
            <AnimatePresence>
                {selectedAgent && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAgent(null)} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]" />
                        <div className="fixed inset-0 flex items-center justify-center z-[160] p-4">
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 50 }} className="w-full max-w-2xl h-[70vh] bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden relative">
                                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-xl bg-gradient-to-br ${selectedAgent.color}`}><selectedAgent.icon className="w-5 h-5 text-white" /></div>
                                        <div>
                                            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">{selectedAgent.name}</h2>
                                            <p className="text-[9px] text-padel-primary font-black uppercase tracking-widest italic">{selectedAgent.role}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-white/5 rounded-lg"><CloseIcon className="w-5 h-5" /></button>
                                </div>
                                <div className="flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col gap-4">
                                    {messages.map((m, i) => (
                                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-2xl max-w-[85%] text-xs font-medium ${m.role === 'user' ? 'bg-padel-primary/10 border border-padel-primary/20 text-white' : 'bg-white/5 border border-white/10 text-gray-300'}`}>{m.content}</div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 border-t border-white/5 flex gap-2">
                                    <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-padel-primary/30" />
                                    <button onClick={handleSendMessage} className="p-3 bg-padel-primary text-black rounded-xl"><Send className="w-4 h-4" /></button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
                {showDocForm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl bg-[#0f0f0f] rounded-3xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
                            <h2 className="text-sm font-black uppercase italic mb-4">{editingDoc ? 'Editar Doc' : 'Nuevo Documento'}</h2>
                            <DocForm initial={editingDoc || undefined} onSave={handleSaveDoc} onCancel={() => setShowDocForm(false)} saving={savingDoc} />
                        </motion.div>
                    </div>
                )}
                {toast && (
                    <motion.div initial={{ opacity: 0, y: 20, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className={`fixed bottom-6 left-1/2 z-[300] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${toast.type === 'ok' ? 'bg-padel-primary text-black' : 'bg-red-500 text-white'}`}>
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .glass { background: rgba(255, 255, 255, 0.02); backdrop-filter: blur(20px); }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
