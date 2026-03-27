/**
 * RAG SERVICE — Retrieval-Augmented Generation con Firestore
 *
 * Estructura de la colección en Firestore:
 * knowledge_base/
 *   {docId}/
 *     title: string          — Título del documento
 *     content: string        — Contenido completo
 *     category: string       — "rules" | "news" | "strategy" | "history" | "formats" | "other"
 *     tags: string[]         — Palabras clave para búsqueda
 *     source: string         — URL o nombre de la fuente
 *     createdAt: Timestamp
 *     updatedAt: Timestamp
 *     isActive: boolean      — Si se usa en el RAG
 *
 * El RAG funciona por coincidencia de keywords entre la pregunta del usuario
 * y los tags/títulos de los documentos, retornando los N más relevantes.
 */

import { getSupabaseClient } from './supabase/client';

export interface KnowledgeDocument {
    id?: string;
    title: string;
    content: string;
    category: 'rules' | 'news' | 'strategy' | 'history' | 'formats' | 'players' | 'other';
    tags: string[];
    source?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

const TABLE_NAME = 'knowledge_base';

// ── Calcular relevancia (score simple por keyword matching) ─────────────────
function computeRelevanceScore(query: string, doc: KnowledgeDocument): number {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);

    let score = 0;

    // Coincidencias en el título (peso alto)
    const titleLower = doc.title.toLowerCase();
    queryWords.forEach(word => {
        if (titleLower.includes(word)) score += 5;
    });

    // Coincidencias exactas en tags (peso máximo)
    doc.tags.forEach(tag => {
        const tagLower = tag.toLowerCase();
        queryWords.forEach(word => {
            if (tagLower.includes(word) || word.includes(tagLower)) score += 8;
        });
        if (queryLower.includes(tagLower)) score += 10;
    });

    // Coincidencias en el contenido (peso bajo)
    const contentLower = doc.content.toLowerCase();
    queryWords.forEach(word => {
        const matches = (contentLower.match(new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        score += Math.min(matches, 5); // cap para evitar spam de una keyword
    });

    // Bonus por categoría relevante según la query
    const categoryKeywords: Record<string, string[]> = {
        rules: ['regla', 'falta', 'saque', 'punto', 'juego', 'set', 'pelota', 'legal', 'ilegal', 'válido'],
        news: ['noticia', 'torneo', 'campeonato', 'resultado', 'ganó', 'perdió', 'clasificó'],
        strategy: ['táctica', 'estrategia', 'técnica', 'golpe', 'bandeja', 'víbora', 'lob', 'smash'],
        history: ['historia', 'origen', 'fundó', 'creó', 'año', 'primer'],
        formats: ['formato', 'americano', 'round robin', 'eliminatoria', 'grupos', 'ronda'],
        players: ['jugador', 'pareja', 'ranking', '#1', 'número uno', 'mejor'],
    };

    Object.entries(categoryKeywords).forEach(([cat, keywords]) => {
        if (doc.category === cat) {
            keywords.forEach(kw => {
                if (queryLower.includes(kw)) score += 3;
            });
        }
    });

    return score;
}

function mapToApp(dbDoc: any): KnowledgeDocument {
    return {
        id: dbDoc.id,
        title: dbDoc.title,
        content: dbDoc.content,
        category: dbDoc.category,
        tags: dbDoc.tags || [],
        source: dbDoc.source,
        isActive: dbDoc.is_active,
        createdAt: dbDoc.created_at,
        updatedAt: dbDoc.updated_at,
    };
}

// ── Obtener documentos relevantes para una query ────────────────────────────
export async function retrieveRelevantDocs(
    userQuery: string,
    maxDocs: number = 3
): Promise<{ context: string; sources: string[] }> {
    try {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase client not initialized');

        const { data, error } = await client
            .from(TABLE_NAME)
            .select('*')
            .eq('is_active', true);

        if (error) throw error;
        if (!data || data.length === 0) {
            return { context: '', sources: [] };
        }

        const docs: KnowledgeDocument[] = data.map(mapToApp);

        // Score y ordenar por relevancia
        const scored = docs
            .map(d => ({ doc: d, score: computeRelevanceScore(userQuery, d) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxDocs);

        if (scored.length === 0) {
            return { context: '', sources: [] };
        }

        const context = scored
            .map(item => `### ${item.doc.title}\n${item.doc.content}`)
            .join('\n\n---\n\n');

        const sources = scored
            .map(item => item.doc.source || item.doc.title)
            .filter(Boolean);

        return { context, sources };
    } catch (error) {
        console.error('[RAG] Error retrieving documents:', error);
        return { context: '', sources: [] };
    }
}

// ── CRUD para el panel de administración ───────────────────────────────────

export async function getAllKnowledgeDocs(): Promise<KnowledgeDocument[]> {
    const client = getSupabaseClient();
    if (!client) return [];

    const { data, error } = await client
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[RAG] Error fetching all docs:', error);
        return [];
    }
    return (data || []).map(mapToApp);
}

export async function addKnowledgeDoc(data: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { data: inserted, error } = await client
        .from(TABLE_NAME)
        .insert({
            title: data.title,
            content: data.content,
            category: data.category,
            tags: data.tags,
            source: data.source,
            is_active: data.isActive
        })
        .select('id')
        .single();

    if (error) throw error;
    return inserted.id;
}

export async function updateKnowledgeDoc(id: string, data: Partial<KnowledgeDocument>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized');

    const updateData: any = {
        updated_at: new Date().toISOString()
    };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const { error } = await client
        .from(TABLE_NAME)
        .update(updateData)
        .eq('id', id);

    if (error) throw error;
}

export async function deleteKnowledgeDoc(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) throw new Error('Supabase client not initialized');

    const { error } = await client
        .from(TABLE_NAME)
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ── Categorías con etiquetas visuales ──────────────────────────────────────
export const KNOWLEDGE_CATEGORIES = [
    { value: 'rules', label: 'Reglamento', color: 'bg-blue-500/20 text-blue-400', emoji: '📋' },
    { value: 'news', label: 'Noticias', color: 'bg-green-500/20 text-green-400', emoji: '📰' },
    { value: 'strategy', label: 'Estrategia', color: 'bg-purple-500/20 text-purple-400', emoji: '🧠' },
    { value: 'history', label: 'Historia', color: 'bg-yellow-500/20 text-yellow-400', emoji: '📜' },
    { value: 'formats', label: 'Formatos', color: 'bg-padel-primary/20 text-padel-primary', emoji: '🏆' },
    { value: 'players', label: 'Jugadores', color: 'bg-orange-500/20 text-orange-400', emoji: '🎾' },
    { value: 'other', label: 'Otros', color: 'bg-white/10 text-gray-400', emoji: '📌' },
] as const;
