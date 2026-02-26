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

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        // 1. System prompt compacto
        const agentPersonas: Record<string, string> = {
            organizer: 'Eres el Organizador Pro de Padel Score. Ayudas a organizar torneos americanos de pádel, calcular fixtures, rankings y gestionar partidos. Responde siempre en español de manera concisa.',
            coach: 'Eres el Coach de Padel Score. Experto en técnica de pádel, estrategias y entrenamiento. Responde siempre en español de manera concisa.',
            analyst: 'Eres el Analista de Padel Score. Analizas estadísticas de torneos y jugadores. Responde siempre en español de manera concisa.',
            safeguard: 'Eres SafeGuard Pro de Padel Score. Ayudas con seguridad e integridad de datos del club. Responde siempre en español de manera concisa.',
        };

        const contextSummary = context
            ? ` El club tiene: ${context.totalTournaments || 0} torneos, ${context.totalPlayers || 0} jugadores, $${context.totalExpenses || 0} en gastos.`
            : '';

        // 2. RAG (truncado a 400 chars para caber en contexto)
        const { context: ragContext, sources } = await fetchRAGContext(message);
        const ragSnippet = ragContext ? ragContext.substring(0, 400) : '';
        const ragBlock = ragSnippet ? ` Contexto extra: ${ragSnippet}` : '';

        const systemPrompt = ((agentPersonas[agentId] || agentPersonas.organizer) + contextSummary + ragBlock).substring(0, 1200);

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
        ];

        // ── 3a. Intentar con GROQ primero (gratis, sin restricciones geográficas) ──
        if (GROQ_API_KEY) {
            const GROQ_MODELS = [
                'llama-3.3-70b-versatile',
                'llama-3.1-8b-instant',
                'mixtral-8x7b-32768',
            ];
            for (const model of GROQ_MODELS) {
                try {
                    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${GROQ_API_KEY}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 800 }),
                    });
                    const groqData = await groqRes.json();
                    console.log(`[Groq] model=${model} status=${groqRes.status}`);
                    if (!groqRes.ok || groqData.error) continue;
                    const text = groqData.choices?.[0]?.message?.content;
                    if (text && text.trim()) {
                        const sourcesFooter = sources.length > 0
                            ? `\n\n---\n📌 *Fuentes: ${sources.join(', ')}*` : '';
                        return NextResponse.json({ role: 'assistant', content: text + sourcesFooter, ragUsed: sources.length > 0, sources });
                    }
                } catch { /* continuar con siguiente modelo */ }
            }
        }

        // ── 3b. Fallback: OpenRouter ──
        if (!OPENROUTER_API_KEY) {
            return NextResponse.json({
                role: 'assistant',
                content: '⚠️ No hay clave de IA configurada. Agrega GROQ_API_KEY en .env.local (gratis en console.groq.com).',
                ragUsed: false, sources: [],
            });
        }

        const OR_MODELS = [
            'qwen/qwen3-4b:free',
            'google/gemma-3-4b-it:free',
            'meta-llama/llama-3.2-3b-instruct:free',
        ];

        for (const model of OR_MODELS) {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://padel-score-pro.vercel.app',
                    'X-Title': 'Padel Score Pro Agents',
                },
                body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: 600 }),
            });
            const orData = await res.json();
            const content = orData?.choices?.[0]?.message?.content;
            console.log(`[OpenRouter] model=${model} status=${res.status} content=${String(content).substring(0, 40)}`);
            if (!res.ok || orData.error || !content) continue;
            const sourcesFooter = sources.length > 0 ? `\n\n---\n📌 *Fuentes: ${sources.join(', ')}*` : '';
            return NextResponse.json({ role: 'assistant', content: content + sourcesFooter, ragUsed: sources.length > 0, sources });
        }

        return NextResponse.json({
            role: 'assistant',
            content: '⚠️ Todos los modelos están temporalmente ocupados. Intenta en unos segundos o crea una key gratuita en console.groq.com',
            ragUsed: false, sources: [],
        });

    } catch (error: unknown) {
        const err = error as Error;
        console.error('AI Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

