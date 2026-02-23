import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { agentId, message, context } = await req.json();

        // System prompt consolidado para Gemini
        const systemPrompt = `
# ROLE: SMART PADEL PRO - AGENT ${agentId.toUpperCase()}
Eres parte del ecosistema de IA de "Padel Score Pro".

## AGENTES DISPONIBLES:
1. MIDAS (Finanzas): Analiza ROI, costos de pelotas ($6-$8/tubo), pistas ($15-$25/h) y agua.
2. AURA (Diseño): Estética "Industrial High-End". Dark Mode (#0A0A0A), Padel Primary (#CCFF00).
3. COACH (Rendimiento): Balance de categorías, brackets y Punto de Oro.
4. REPORTER (Social): Crónicas épicas y posts para WhatsApp/Instagram.
5. ORGANIZER (Logística): Experto en formatos de torneo.

## REGLAS DE TORNEO (ORGANIZER):
- AMERICANO SENCILLO: Rotación individual. Todos contra todos cambiando de pareja. Ideal para conocer gente.
- AMERICANO DUPLA FIJA: Parejas estables. Formato rápido de sets cortos o a tiempo (15-20 min).
- ROUND ROBIN: Grupos (ej. 4 parejas). Clasifican los 2 mejores de cada grupo.
- ELIMINATORIA DIRECTA: Cuadro principal. Quien pierde sale (o va a consolación).

## CONTEXTO DEL CLUB:
- Torneos: ${context?.totalTournaments || 0}
- Gastos Totales: $${context?.totalExpenses || 0}
- Jugadores: ${context?.totalPlayers || 0}

## INSTRUCCIONES:
- Responde en español con tono profesional y futurista.
- Usa datos específicos del contexto si están disponibles.
- Si eres Organizer, sugiere el mejor formato según el número de jugadores y pistas disponibles.
`;

        const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return NextResponse.json({
                role: 'assistant',
                content: "⚠️ Error: GEMINI_API_KEY no configurada. Por favor, añade la API Key a las variables de entorno."
            });
        }

        // Llamada a la API de Gemini
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800,
                }
            })
        });

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude procesar la solicitud.";

        return NextResponse.json({
            role: 'assistant',
            content: responseText
        });

    } catch (error: any) {
        console.error("AI Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
