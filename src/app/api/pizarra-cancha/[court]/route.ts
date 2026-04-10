import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ court: string }> }
) {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'No configurado' }, { status: 501 });
    }
    const { court } = await params;
    const num = parseInt(court, 10);
    if (!Number.isFinite(num) || num < 1) {
        return NextResponse.json({ error: 'Cancha debe ser un entero >= 1' }, { status: 400 });
    }
    const { data, error } = await supabase
        .from('pizarra_cancha')
        .select('tournament_id, match_id')
        .eq('court_number', num)
        .maybeSingle();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data?.tournament_id || !data?.match_id) {
        return NextResponse.json({ tournamentId: null, matchId: null });
    }
    return NextResponse.json({
        tournamentId: data.tournament_id,
        matchId: data.match_id,
    });
}
