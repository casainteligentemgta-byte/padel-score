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

import { db } from './firebase';
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    orderBy,
    Timestamp,
} from 'firebase/firestore';

export interface KnowledgeDocument {
    id?: string;
    title: string;
    content: string;
    category: 'rules' | 'news' | 'strategy' | 'history' | 'formats' | 'players' | 'other';
    tags: string[];
    source?: string;
    isActive: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

const COLLECTION = 'knowledge_base';

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
        const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
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

// ── Obtener documentos relevantes para una query ────────────────────────────
export async function retrieveRelevantDocs(
    userQuery: string,
    maxDocs: number = 3
): Promise<{ context: string; sources: string[] }> {
    try {
        const q = query(
            collection(db, COLLECTION),
            where('isActive', '==', true)
        );
        const snap = await getDocs(q);

        if (snap.empty) {
            return { context: '', sources: [] };
        }

        const docs: KnowledgeDocument[] = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as Omit<KnowledgeDocument, 'id'>),
        }));

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
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<KnowledgeDocument, 'id'>) }));
}

export async function addKnowledgeDoc(data: Omit<KnowledgeDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COLLECTION), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    });
    return ref.id;
}

export async function updateKnowledgeDoc(id: string, data: Partial<KnowledgeDocument>): Promise<void> {
    await updateDoc(doc(db, COLLECTION, id), {
        ...data,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteKnowledgeDoc(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
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
