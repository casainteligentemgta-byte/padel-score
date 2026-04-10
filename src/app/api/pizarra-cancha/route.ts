import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'No configurado' }, { status: 501 });
    }
    let body: { courtNumber: number; tournamentId: string; matchId: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }
    const { courtNumber, tournamentId, matchId } = body;
    const parsedCourt = Number(courtNumber);
    if (!Number.isFinite(parsedCourt) || parsedCourt < 1) {
        return NextResponse.json({ error: 'courtNumber debe ser un entero >= 1' }, { status: 400 });
    }
    if (!tournamentId?.trim() || !matchId?.trim()) {
        return NextResponse.json({ error: 'tournamentId y matchId son obligatorios' }, { status: 400 });
    }
    const { error } = await supabase
        .from('pizarra_cancha')
        .upsert(
            {
                court_number: Math.floor(parsedCourt),
                tournament_id: String(tournamentId).trim(),
                match_id: String(matchId).trim(),
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'court_number' }
        );
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'No configurado' }, { status: 501 });
    }
    let body: { courtNumber: number };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
    }
    const num = Number(body?.courtNumber);
    if (!Number.isFinite(num) || num < 1) {
        return NextResponse.json({ error: 'courtNumber debe ser un entero >= 1' }, { status: 400 });
    }
    const { error } = await supabase
        .from('pizarra_cancha')
        .delete()
        .eq('court_number', num);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
}
