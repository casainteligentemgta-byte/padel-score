import { NextResponse } from 'next/server';
import { buildSystemPrompt } from '@/lib/padelKnowledge';

// RAG: recupera documentos relevantes desde Firestore (server-side)
async function fetchRAGContext(userQuery: string): Promise<{ context: string; sources: string[] }> {
    try {
        // Usamos la Firebase REST API directamente (sin el SDK cliente en el servidor)
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

        if (!projectId || !apiKey) return { context: '', sources: [] };

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/knowledge_base?key=${apiKey}&pageSize=50`;
        const res = await fetch(url);
        if (!res.ok) return { context: '', sources: [] };

        const data = await res.json();
        const rawDocs = data.documents || [];

        // Parsear documentos de Firestore REST format
        interface FirestoreField {
            stringValue?: string;
            booleanValue?: boolean;
            arrayValue?: { values?: FirestoreField[] };
        }
        interface FirestoreDoc {
            name: string;
            fields?: Record<string, FirestoreField>;
        }
        const docs = rawDocs
            .map((d: FirestoreDoc) => {
                if (!d.fields) return null;
                const f = d.fields;
                return {
                    title: f.title?.stringValue || '',
                    content: f.content?.stringValue || '',
                    category: f.category?.stringValue || 'other',
                    tags: (f.tags?.arrayValue?.values || []).map((v: FirestoreField) => v.stringValue || ''),
                    source: f.source?.stringValue || '',
                    isActive: f.isActive?.booleanValue ?? true,
                };
            })
            .filter((d: { isActive: boolean } | null) => d && d.isActive);

        if (docs.length === 0) return { context: '', sources: [] };

        // Score por relevancia
        const queryLower = userQuery.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter((w: string) => w.length > 3);

        interface DocItem {
            title: string;
            content: string;
            category: string;
            tags: string[];
            source: string;
            isActive: boolean;
        }

        const scored = docs
            .map((doc: DocItem) => {
                let score = 0;
                const titleLower = doc.title.toLowerCase();
                queryWords.forEach((w: string) => { if (titleLower.includes(w)) score += 5; });
                doc.tags.forEach((tag: string) => {
                    const tagL = tag.toLowerCase();
                    queryWords.forEach((w: string) => { if (tagL.includes(w) || w.includes(tagL)) score += 8; });
                    if (queryLower.includes(tagL)) score += 10;
                });
                const contentMatches = queryWords.reduce((sum: number, w: string) => {
                    return sum + Math.min((doc.content.toLowerCase().match(new RegExp(w, 'g')) || []).length, 5);
                }, 0);
                score += contentMatches;
                return { doc, score };
            })
            .filter((item: { score: number }) => item.score > 0)
            .sort((a: { score: number }, b: { score: number }) => b.score - a.score)
            .slice(0, 3);

        if (scored.length === 0) return { context: '', sources: [] };

        const context = scored
            .map((item: { doc: DocItem }) => `### ${item.doc.title}\n${item.doc.content}`)
            .join('\n\n---\n\n');

        const sources = scored
            .map((item: { doc: DocItem }) => item.doc.source || item.doc.title)
            .filter(Boolean);

        return { context, sources };
    } catch (e) {
        console.error('[RAG API] Error:', e);
        return { context: '', sources: [] };
    }
}

export async function POST(req: Request) {
    try {
        const { agentId, message, context } = await req.json();

        const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return NextResponse.json({
                role: 'assistant',
                content: '⚠️ Error: GEMINI_API_KEY no configurada. Por favor, añade la API Key a las variables de entorno.',
            });
        }

        // 1. Recuperar documentos RAG relevantes de Firestore
        const { context: ragContext, sources } = await fetchRAGContext(message);

        // 2. Construir el system prompt con conocimiento de pádel + contexto dinámico
        const baseSystemPrompt = buildSystemPrompt(agentId, context);

        // 3. Añadir contexto RAG si hay documentos relevantes
        const ragBlock = ragContext
            ? `\n\n## 📚 DOCUMENTOS ADICIONALES RELEVANTES (Base de Conocimiento del Club)\n${ragContext}\n\nINSTRUCCIÓN: Si alguno de estos documentos es relevante para la pregunta, usa su información y cítalo en tu respuesta.`
            : '';

        const fullSystemPrompt = baseSystemPrompt + ragBlock;

        // 4. Llamada a Gemini 1.5 Flash
        const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${fullSystemPrompt}\n\n---\n\nUSUARIO: ${message}` }],
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1200,
                    },
                }),
            }
        );

        const geminiData = await geminiRes.json();
        const responseText =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text ||
            'No pude procesar la solicitud. Por favor, intenta de nuevo.';

        // 5. Si había fuentes RAG, añadir footer de fuentes
        const sourcesFooter = sources.length > 0
            ? `\n\n---\n📌 *Fuentes consultadas: ${sources.join(', ')}*`
            : '';

        return NextResponse.json({
            role: 'assistant',
            content: responseText + sourcesFooter,
            ragUsed: sources.length > 0,
            sources,
        });
    } catch (error: unknown) {
        const err = error as Error;
        console.error('AI Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
