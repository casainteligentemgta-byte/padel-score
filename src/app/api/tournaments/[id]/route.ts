import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { validateTournamentId } from '@/lib/apiValidation';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    try {
        const { id } = await params;
        const idValidation = validateTournamentId(id);
        if (idValidation.error) {
            return NextResponse.json({ error: idValidation.error }, { status: 400 });
        }

        const supabase = getSupabaseServiceClient();
        if (!supabase) {
            return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
        }

        const { data: trow, error: tErr } = await supabase
            .from('tournaments')
            .select('id, data')
            .eq('id', id)
            .maybeSingle();
        if (tErr) {
            return NextResponse.json({ error: tErr.message }, { status: 500 });
        }
        if (!trow) {
            return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
        }

        const data = ((trow as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>;
        const { data: matchRows } = await supabase
            .from('tournament_matches')
            .select('id, data')
            .eq('tournament_id', id);

        const matches = (matchRows || []).map((m) => {
            const d = ((m as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>;
            return {
                id: (m as { id: string }).id,
                team1: { name: d.team1Name || (d.team1 as { p1?: { name?: string } } | undefined)?.p1?.name || 'TBD' },
                team2: { name: d.team2Name || (d.team2 as { p1?: { name?: string } } | undefined)?.p1?.name || 'TBD' },
                scheduledTime: d.scheduledTime,
                status: d.status,
                courtName: d.courtName,
            };
        });

        return NextResponse.json({
            success: true,
            tournament: {
                id: (trow as { id: string }).id,
                name: data.name,
                type: data.type,
                bufferMinutes: data.bufferMinutes,
            },
            matches,
        });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Error al obtener el torneo',
            details: error instanceof Error ? error.message : undefined,
        }, { status: 500 });
    }
}
