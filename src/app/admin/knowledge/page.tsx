'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Plus, Trash2, Edit3, Search, Filter,
    Brain, CheckCircle2, XCircle, Save, X, Loader2,
    Database, Sparkles, FolderOpen, Tag, Link2, Eye, EyeOff,
    RefreshCw, ChevronDown, FileText
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/lib/AuthContext';
import {
    getAllKnowledgeDocs,
    addKnowledgeDoc,
    updateKnowledgeDoc,
    deleteKnowledgeDoc,
    KNOWLEDGE_CATEGORIES,
    KnowledgeDocument,
} from '@/lib/ragService';

// ── Editor de documento ──────────────────────────────────────────────────────
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
            {/* Título */}
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

            {/* Categoría */}
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

            {/* Contenido */}
            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                    Contenido <span className="text-gray-700 normal-case">({content.length} chars)</span>
                </label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    required
                    rows={10}
                    placeholder="Pega aquí el texto del reglamento, noticia, artículo estratégico... Puede ser markdown."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white/80 placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50 resize-y font-mono leading-relaxed"
                />
            </div>

            {/* Tags */}
            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">
                    Tags / Palabras Clave <span className="text-gray-700 normal-case">(separados por coma)</span>
                </label>
                <input
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="saque, falta, doble falta, servicio, regla"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50"
                />
                {tagsInput && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {tagsInput.split(',').filter(t => t.trim()).map((t, i) => (
                            <span key={i} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${cat?.color || 'bg-white/10 text-gray-400'}`}>
                                {t.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Fuente */}
            <div>
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1.5">Fuente (URL o descripción)</label>
                <input
                    value={source}
                    onChange={e => setSource(e.target.value)}
                    placeholder="https://padelfip.com/rules o 'Reglamento FIP 2024'"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/50"
                />
            </div>

            {/* Estado activo */}
            <div className="flex items-center justify-between bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
                <div>
                    <p className="text-xs font-black text-white">Documento Activo</p>
                    <p className="text-[9px] text-gray-600">Si está activo, se usa en el RAG del agente de IA</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsActive(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-padel-primary' : 'bg-white/10'}`}
                >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-white/5 text-gray-400 hover:bg-white/10"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={saving || !title || !content}
                    className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest bg-padel-primary text-black hover:bg-padel-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? 'Guardando...' : 'Guardar'}
                </button>
            </div>
        </form>
    );
}

// ── Tarjeta de documento ─────────────────────────────────────────────────────
function DocCard({
    doc,
    onEdit,
    onToggle,
    onDelete,
}: {
    doc: KnowledgeDocument;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const cat = KNOWLEDGE_CATEGORIES.find(c => c.value === doc.category);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className={`rounded-2xl border overflow-hidden transition-all ${doc.isActive
                ? 'border-white/[0.08] bg-white/[0.02]'
                : 'border-white/[0.04] bg-white/[0.01] opacity-50'
                }`}
        >
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${cat?.color || 'bg-white/5 text-gray-400'}`}>
                    {cat?.emoji || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-xs font-black italic uppercase tracking-tight text-white leading-tight line-clamp-2">
                            {doc.title}
                        </h3>
                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${doc.isActive ? 'bg-padel-primary/20 text-padel-primary' : 'bg-white/5 text-gray-600'}`}>
                            {doc.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${cat?.color || 'bg-white/5 text-gray-500'}`}>
                            {cat?.label}
                        </span>
                        <span className="text-[8px] text-gray-700">{doc.content.length.toLocaleString()} chars</span>
                        {doc.source && (
                            <span className="flex items-center gap-0.5 text-[8px] text-gray-700 truncate max-w-[120px]">
                                <Link2 className="w-2.5 h-2.5" />{doc.source}
                            </span>
                        )}
                    </div>
                    {/* Tags */}
                    {doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.slice(0, 5).map((tag, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-white/5 text-gray-600 text-[7px] font-bold rounded uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                            {doc.tags.length > 5 && (
                                <span className="text-[7px] text-gray-700">+{doc.tags.length - 5}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Expandir contenido */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-3 border-t border-white/[0.04]">
                            <pre className="text-[10px] text-gray-500 leading-relaxed whitespace-pre-wrap mt-3 max-h-48 overflow-y-auto font-mono">
                                {doc.content}
                            </pre>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex border-t border-white/[0.04]">
                <button
                    onClick={() => setExpanded(v => !v)}
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 hover:bg-white/[0.03] transition-all"
                >
                    {expanded ? <ChevronDown className="w-3 h-3 rotate-180" /> : <Eye className="w-3 h-3" />}
                    {expanded ? 'Ocultar' : 'Ver'}
                </button>
                <button
                    onClick={onToggle}
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/5 transition-all border-x border-white/[0.04]"
                >
                    {doc.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {doc.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                    onClick={onEdit}
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-600 hover:text-padel-primary hover:bg-padel-primary/5 transition-all border-r border-white/[0.04]"
                >
                    <Edit3 className="w-3 h-3" /> Editar
                </button>
                <button
                    onClick={onDelete}
                    className="flex-1 py-2 flex items-center justify-center gap-1 text-[8px] font-black uppercase tracking-widest text-gray-600 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                    <Trash2 className="w-3 h-3" /> Eliminar
                </button>
            </div>
        </motion.div>
    );
}

// ── Página principal ─────────────────────────────────────────────────────────
export default function KnowledgeBasePage() {
    const { isAdmin } = useAuth();
    const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [showForm, setShowForm] = useState(false);
    const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

    // ── Load ──────────────────────────────────────────────────────────────
    const loadDocs = async () => {
        setLoading(true);
        try {
            const data = await getAllKnowledgeDocs();
            setDocs(data);
        } catch (e) {
            console.error(e);
            showToast('Error cargando documentos', 'err');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadDocs(); }, []);

    const showToast = (msg: string, type: 'ok' | 'err') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ── CRUD ──────────────────────────────────────────────────────────────
    const handleSave = async (data: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>) => {
        setSaving(true);
        try {
            if (editingDoc?.id) {
                await updateKnowledgeDoc(editingDoc.id, data);
                showToast('Documento actualizado ✓', 'ok');
            } else {
                await addKnowledgeDoc(data);
                showToast('Documento añadido ✓', 'ok');
            }
            setShowForm(false);
            setEditingDoc(null);
            await loadDocs();
        } catch (e) {
            console.error(e);
            showToast('Error guardando documento', 'err');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('¿Eliminar este documento de la base de conocimiento?')) return;
        try {
            await deleteKnowledgeDoc(docId);
            showToast('Documento eliminado', 'ok');
            await loadDocs();
        } catch (e) {
            console.error(e);
            showToast('Error eliminando', 'err');
        }
    };

    const handleToggle = async (d: KnowledgeDocument) => {
        if (!d.id) return;
        try {
            await updateKnowledgeDoc(d.id, { isActive: !d.isActive });
            await loadDocs();
        } catch (e) { console.error(e); }
    };

    // ── Filtered ──────────────────────────────────────────────────────────
    const filtered = docs.filter(d => {
        const matchCat = filterCategory === 'all' || d.category === filterCategory;
        const matchSearch = !searchQuery || [d.title, ...d.tags, d.content].some(
            s => s.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchCat && matchSearch;
    });

    const activeDocs = docs.filter(d => d.isActive).length;
    const totalChars = docs.reduce((sum, d) => sum + d.content.length, 0);

    // ── Render ────────────────────────────────────────────────────────────
    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden font-outfit">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden pl-20 md:pl-24">

                {/* Header */}
                <header className="flex-shrink-0 flex items-center justify-between px-4 lg:px-6 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-padel-primary/10 rounded-xl border border-padel-primary/20">
                            <Brain className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-base font-black italic uppercase tracking-tighter leading-none">Base de Conocimiento</h1>
                                <span className="px-1.5 py-0.5 bg-padel-primary/10 text-padel-primary text-[7px] font-black rounded uppercase tracking-widest border border-padel-primary/20 flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" /> RAG
                                </span>
                            </div>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.15em] mt-0.5">
                                Agente de IA · NotebookLM-style
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={loadDocs} className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => { setEditingDoc(null); setShowForm(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-padel-primary text-black text-xs font-black rounded-xl hover:bg-padel-primary/90 transition-all uppercase tracking-wider"
                            >
                                <Plus className="w-4 h-4" /> Añadir Documento
                            </button>
                        )}
                    </div>
                </header>

                {/* Stats strip */}
                <div className="flex-shrink-0 grid grid-cols-3 gap-px bg-white/[0.04] border-b border-white/[0.04]">
                    {[
                        { label: 'Documentos', value: docs.length, icon: FileText, color: 'text-white' },
                        { label: 'Activos en RAG', value: activeDocs, icon: Brain, color: 'text-padel-primary' },
                        { label: 'Total caracteres', value: totalChars.toLocaleString(), icon: Database, color: 'text-blue-400' },
                    ].map(stat => (
                        <div key={stat.label} className="flex items-center gap-2.5 px-4 py-2.5 bg-[#050505]">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <div>
                                <p className={`text-sm font-black italic ${stat.color}`}>{stat.value}</p>
                                <p className="text-[8px] text-gray-700 uppercase tracking-widest font-bold">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
                    <div className="relative flex-1 max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-600" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar en la base de conocimiento..."
                            className="w-full bg-white/5 border border-white/[0.06] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-gray-700 focus:outline-none focus:border-padel-primary/40"
                        />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                            onClick={() => setFilterCategory('all')}
                            className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filterCategory === 'all' ? 'bg-white/10 text-white border border-white/10' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                            Todos ({docs.length})
                        </button>
                        {KNOWLEDGE_CATEGORIES.map(c => {
                            const count = docs.filter(d => d.category === c.value).length;
                            if (count === 0) return null;
                            return (
                                <button
                                    key={c.value}
                                    onClick={() => setFilterCategory(c.value)}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filterCategory === c.value ? `${c.color} border border-current` : 'text-gray-600 hover:text-gray-400'}`}
                                >
                                    {c.emoji} {c.label} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-4 lg:px-6 py-4">

                    {/* Form modal */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                            >
                                <motion.div
                                    initial={{ scale: 0.95, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 0.95, y: 20 }}
                                    className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0f0f0f] rounded-3xl border border-white/10 shadow-2xl p-6"
                                >
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-sm font-black italic uppercase tracking-tighter">
                                            {editingDoc ? '✏️ Editar Documento' : '+ Nuevo Documento'}
                                        </h2>
                                        <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <DocForm
                                        initial={editingDoc || undefined}
                                        onSave={handleSave}
                                        onCancel={() => setShowForm(false)}
                                        saving={saving}
                                    />
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-3 opacity-30">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span className="text-xs font-black uppercase tracking-widest">Cargando base de conocimiento...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                            <BookOpen className="w-12 h-12" />
                            <div className="text-center">
                                <p className="text-sm font-black italic uppercase tracking-tighter">
                                    {searchQuery ? 'Sin resultados' : 'Base de conocimiento vacía'}
                                </p>
                                <p className="text-[9px] text-gray-600 mt-1 uppercase tracking-widest">
                                    {searchQuery ? 'Prueba otra búsqueda' : 'Añade el reglamento, noticias o artículos de pádel'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                            <AnimatePresence mode="popLayout">
                                {filtered.map(d => (
                                    <DocCard
                                        key={d.id}
                                        doc={d}
                                        onEdit={() => { setEditingDoc(d); setShowForm(true); }}
                                        onToggle={() => handleToggle(d)}
                                        onDelete={() => d.id && handleDelete(d.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 20, x: '-50%' }}
                        className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl
                            ${toast.type === 'ok' ? 'bg-padel-primary text-black' : 'bg-red-500 text-white'}`}
                    >
                        {toast.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
