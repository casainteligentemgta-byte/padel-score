import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServer';
import { validateAiBody } from '@/lib/apiValidation';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildSystemPrompt } from '@/lib/padelKnowledge';

// RAG: recupera documentos relevantes desde Firestore (server-side)

export async function POST(req: Request) {
    if (!checkRateLimit(req)) {
        return NextResponse.json(
            { error: 'Demasiadas peticiones. Espera un minuto e intenta de nuevo.' },
            { status: 429 }
        );
    }
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    try {
        const body = await req.json();
        const validation = validateAiBody(body);
        if (validation.error) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        // Determinar formato (Agentes o Crónica)
        let agentId = body.agentId || body.role || 'organizer';
        let message = body.message || body.prompt || '';
        const context = body.context;

        // Mapear roles antiguos a nuevos agentes si es necesario
        if (agentId === 'reporter') agentId = 'media';
        if (agentId === 'analyst') agentId = 'stats';
        if (agentId === 'coach') agentId = 'organizer';

        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

        // 1. System prompt compacto
        const agentPersonas: Record<string, string> = {
            safeguard: 'Eres SafeGuard Pro de Padel Score. Especialista en seguridad, auditoría de logs y protección de datos. Tu estilo es profesional, directo y vigilante. Responde siempre en español.',
            media: 'Eres Media Master de Padel Score. Especialista en prensa, creación de contenido y marketing deportivo. Tu estilo es vibrante, creativo y entusiasta. Responde siempre en español.',
            stats: 'Eres Stats Guru de Padel Score. Experto en análisis de datos, rendimiento de jugadores y estadísticas avanzadas. Tu estilo es analítico, basado en datos y preciso. Responde siempre en español.',
            organizer: 'Eres el Organizador Pro de Padel Score. Experto en logística de torneos, fixtures y gestión de tiempos. Tu estilo es práctico, eficiente y organizado. Responde siempre en español.',
            midas: 'Eres Agente Midas de Padel Score. Consultor financiero especializado en ROI y rentabilidad de clubes. Tu estilo es estratégico, enfocado en el valor y el ahorro. Responde siempre en español.',
            aura: 'Eres Aura Design de Padel Score. Especialista en UX/UI y estética futurista para clubes de pádel. Tu estilo es sofisticado, minimalista y vanguardista. Responde siempre en español.'
        };

        const contextSummary = context
            ? ` El club tiene: ${context.totalTournaments || 0} torneos, ${context.totalPlayers || 0} jugadores, $${context.totalExpenses || 0} en gastos.`
            : '';

        // 2. RAG
        const { ragBlock, sources } = await fetchRAGContext(message, agentId);

        const systemPrompt = ((agentPersonas[agentId] || agentPersonas.organizer) + contextSummary + (ragBlock || '')).substring(0, 2000);

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
                        const fullResponse = text + sourcesFooter;
                        return NextResponse.json({
                            role: 'assistant',
                            content: fullResponse,
                            text: fullResponse, // Compatibilidad con crónicas
                            ragUsed: sources.length > 0,
                            sources
                        });
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
            const fullResponse = content + sourcesFooter;
            return NextResponse.json({
                role: 'assistant',
                content: fullResponse,
                text: fullResponse, // Compatibilidad con crónicas
                ragUsed: sources.length > 0,
                sources
            });
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

// ── RAG RELEVANCE ENGINE (SERVER SIDE) ──────────────────────────────────────────
async function fetchRAGContext(query: string, agentId: string) {
    try {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        if (!apiKey || !projectId) return { ragBlock: '', sources: [] };

        const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/knowledge_base?key=${apiKey}&pageSize=100`;
        const res = await fetch(url);
        if (!res.ok) return { ragBlock: '', sources: [] };

        const data = await res.json();
        const docs = (data.documents || []).map((d: any) => ({
            id: d.name.split('/').pop(),
            title: d.fields.title?.stringValue || 'Sin Título',
            content: d.fields.content?.stringValue || '',
            tags: (d.fields.tags?.arrayValue?.values || []).map((v: any) => v.stringValue || ''),
            category: d.fields.category?.stringValue || 'general'
        }));

        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 3);

        const scored = docs.map((doc: any) => {
            let score = 0;
            const titleLower = doc.title.toLowerCase();
            queryWords.forEach(w => { if (titleLower.includes(w)) score += 5; });

            doc.tags.forEach((tag: string) => {
                const tagL = tag.toLowerCase();
                queryWords.forEach(w => { if (tagL.includes(w)) score += 8; });
            });

            const contentMatches = queryWords.reduce((sum, w) => {
                try {
                    const escapedWord = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const matches = (doc.content.toLowerCase().match(new RegExp(escapedWord, 'g')) || []).length;
                    return sum + Math.min(matches, 5);
                } catch {
                    return sum;
                }
            }, 0);

            score += contentMatches;
            return { doc, score };
        });

        const relevant = scored
            .filter((s: any) => s.score > 2)
            .sort((a: any, b: any) => b.score - a.score)
            .slice(0, 3);

        const ragBlock = relevant.length > 0
            ? `\nCONTEXTO DE CONOCIMIENTO:\n${relevant.map((s: any) => `[${s.doc.title}]: ${s.doc.content}`).join('\n')}\n`
            : '';

        return { ragBlock, sources: relevant.map((s: any) => s.doc.title) };

    } catch (e) {
        console.error('RAG Engine Error:', e);
        return { ragBlock: '', sources: [] };
    }
}

