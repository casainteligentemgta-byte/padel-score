'use client';

import React, { useState } from 'react';
import {
    FileText, Share2, Edit3, Plus, X, Save, Download
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatCategory } from '../utils';

interface RulesViewProps {
    tournaments: Record<string, any>;
    canManage: boolean;
}

export const RulesView: React.FC<RulesViewProps> = ({ tournaments, canManage }) => {
    // 1. Agrupar categorías por reglas exactas para evitar redundancia
    const groupedRules: {
        tids: string[];
        categories: string[];
        content: string;
        manuals: any[];
    }[] = [];

    Object.values(tournaments).forEach((t: any) => {
        const r = t.rules || { content: '', manuals: [] };
        const key = `${r.content}_${JSON.stringify(r.manuals)}`;

        let existing = groupedRules.find(g => `${g.content}_${JSON.stringify(g.manuals)}` === key);
        const catName = `${formatCategory(t.category)} ${t.gender === 'MALE' ? '♂' : t.gender === 'FEMALE' ? '♀' : '⚥'}`;

        if (existing) {
            existing.tids.push(t.id);
            existing.categories.push(catName);
        } else {
            groupedRules.push({
                tids: [t.id],
                categories: [catName],
                content: r.content,
                manuals: r.manuals || []
            });
        }
    });

    // Formatear el título del grupo (ej: "Cat 5, 6 y 7 ♂")
    const getGroupTitle = (cats: string[]) => {
        if (cats.length === 0) return 'Reglamento';
        if (cats.length === 1) return `Reglas de ${cats[0]}`;
        const last = cats[cats.length - 1];
        const others = cats.slice(0, -1).join(', ');
        return `Reglas de ${others} y ${last}`;
    };

    // Estado para edición
    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editManuals, setEditManuals] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    const startEditing = (idx: number, group: any) => {
        setEditingIdx(idx);
        setEditContent(group.content);
        setEditManuals(group.manuals);
    };

    const handleSaveGroup = async (tids: string[]) => {
        setSaving(true);
        try {
            const batch = tids.map(tid => updateDoc(doc(db, 'tournaments', tid), {
                'rules.content': editContent,
                'rules.manuals': editManuals
            }));
            await Promise.all(batch);
            setEditingIdx(null);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const shareGroupRules = (group: any) => {
        const title = getGroupTitle(group.categories);
        let text = `📋 *${title.toUpperCase()}*\n\n`;
        text += group.content || 'Sin descripción detallada.';
        if (group.manuals?.length > 0) {
            text += '\n\n📥 *Manuales oficiales:*';
            group.manuals.forEach((m: any) => {
                if (m.title && m.url) text += `\n- ${m.title}: ${m.url}`;
            });
        }

        if (navigator.share) {
            navigator.share({ title, text }).catch(() => {
                navigator.clipboard.writeText(text);
            });
        } else {
            navigator.clipboard.writeText(text);
            alert('¡Copiado al portapapeles!');
        }
    };

    const addManual = () => setEditManuals([...editManuals, { title: '', url: '' }]);
    const updateManual = (idx: number, field: string, val: string) => {
        const next = [...editManuals];
        next[idx] = { ...next[idx], [field]: val };
        setEditManuals(next);
    };
    const removeManual = (idx: number) => setEditManuals(editManuals.filter((_, i) => i !== idx));

    if (groupedRules.length === 0) return (
        <div className="py-24 text-center space-y-4 opacity-20">
            <FileText className="w-16 h-16 mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">No hay categorías configuradas</p>
        </div>
    );

    return (
        <div className="space-y-10 pb-10">
            {groupedRules.map((group, idx) => {
                const isEditing = editingIdx === idx;
                const title = getGroupTitle(group.categories);

                return (
                    <div key={idx} className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex-1">
                                <h3 className="text-sm font-black uppercase tracking-widest text-[#ccff00] leading-tight">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                                        {group.tids.length} {group.tids.length === 1 ? 'categoría' : 'categorías'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => shareGroupRules(group)}
                                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#ccff00] hover:bg-[#ccff00]/10 transition-all flex items-center gap-2"
                                    title="Compartir reglas"
                                >
                                    <Share2 className="w-4 h-4" />
                                    <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Enviar</span>
                                </button>
                                {canManage && !isEditing && (
                                    <button
                                        onClick={() => startEditing(idx, group)}
                                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-[#ccff00] transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 bg-white/[0.03] border border-white/10 rounded-3xl p-5">
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl mb-2">
                                    <p className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest leading-normal">
                                        ⚠️ Estás editando las reglas para: {group.categories.join(', ')}.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Texto de las Reglas</label>
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        placeholder="Introduce aquí las reglas (puntos de oro, duración, etc...)"
                                        className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-gray-300 focus:border-[#ccff00] outline-none transition-colors resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Manuales PDF (Links)</label>
                                        <button onClick={addManual} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-[9px] font-black uppercase tracking-widest hover:bg-[#ccff00]/20 transition-all">
                                            <Plus className="w-3 h-3" /> Añadir
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {editManuals.map((m, i) => (
                                            <div key={i} className="flex gap-2 items-center">
                                                <input
                                                    placeholder="Título"
                                                    value={m.title}
                                                    onChange={(e) => updateManual(i, 'title', e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-gray-300 outline-none"
                                                />
                                                <input
                                                    placeholder="URL"
                                                    value={m.url}
                                                    onChange={(e) => updateManual(i, 'url', e.target.value)}
                                                    className="flex-[2] bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[10px] text-gray-300 outline-none"
                                                />
                                                <button onClick={() => removeManual(i)} className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => handleSaveGroup(group.tids)}
                                        disabled={saving}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#ccff00] text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <Save className="w-3.5 h-3.5" /> {saving ? 'Guardando...' : 'Guardar en Grupo'}
                                    </button>
                                    <button
                                        onClick={() => setEditingIdx(null)}
                                        className="px-6 py-3 bg-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 min-h-[80px]">
                                    {group.content ? (
                                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-wrap">{group.content}</p>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center py-4 opacity-20">
                                            <FileText className="w-6 h-6 mb-2" />
                                            <p className="text-[9px] font-black uppercase tracking-widest">Sin detalles definidos</p>
                                        </div>
                                    )}
                                </div>

                                {group.manuals.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {group.manuals.map((m, i) => m.url && (
                                            <a
                                                key={i}
                                                href={m.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-2xl p-3 hover:bg-white/[0.06] hover:border-[#ccff00]/30 transition-all group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-[#ccff00] transition-colors">
                                                    <Download className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 truncate">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-300 truncate">{m.title || 'Manual'}</h4>
                                                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest truncate">Descargar PDF</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
