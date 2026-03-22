/**
 * POST /api/match/report
 * Reporte de resultado con validación en servidor: solo los 4 jugadores del partido
 * (Pareja A y Pareja B) pueden cargar el resultado. Evita manipulación desde la consola.
 */
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { MatchStatus } from '@/types/tournament';

const now = () => new Date().toISOString();

export async function POST(req: Request) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    const uid = authResult.uid;

    let body: { compositeId?: string; winnerTeam?: 1 | 2 };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'Cuerpo inválido' }, { status: 400 });
    }

    const compositeId = body.compositeId;
    const winnerTeam = body.winnerTeam;
    if (!compositeId || typeof compositeId !== 'string' || (winnerTeam !== 1 && winnerTeam !== 2)) {
        return NextResponse.json(
            { error: 'Se requieren compositeId y winnerTeam (1 o 2)' },
            { status: 400 }
        );
    }

    const parts = compositeId.split('--');
    const tournamentId = parts[0];
    const matchId = parts[1];
    if (!tournamentId || !matchId) {
        return NextResponse.json({ error: 'Enlace inválido' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json(
            { error: 'Configuración del servidor: falta SUPABASE_SERVICE_ROLE_KEY' },
            { status: 501 }
        );
    }

    const { data: matchRows, error: matchErr } = await supabase
        .from('tournament_matches')
        .select('id, data')
        .eq('tournament_id', tournamentId)
        .eq('id', matchId)
        .limit(1);

    if (matchErr || !matchRows?.length) {
        return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
    }

    const matchData = matchRows[0].data as Record<string, unknown> || {};
    const team1 = matchData.team1 as { p1?: { id?: string }; p2?: { id?: string } } | undefined;
    const team2 = matchData.team2 as { p1?: { id?: string }; p2?: { id?: string } } | undefined;

    const participantIds = [
        team1?.p1?.id,
        team1?.p2?.id,
        team2?.p1?.id,
        team2?.p2?.id,
    ].filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (participantIds.length === 0) {
        return NextResponse.json(
            { error: 'Partido sin jugadores asignados' },
            { status: 400 }
        );
    }

    const { data: participants, error: partErr } = await supabase
        .from('participants')
        .select('id, owner_id')
        .in('id', participantIds);

    if (partErr || !participants?.length) {
        return NextResponse.json(
            { error: 'No se pudieron verificar los jugadores del partido' },
            { status: 500 }
        );
    }

    const allowedUserIds = [...new Set(participants.map((p: { owner_id: string }) => p.owner_id))];
    if (!allowedUserIds.includes(uid)) {
        return NextResponse.json(
            { error: 'Solo los 4 jugadores del partido pueden cargar el resultado' },
            { status: 403 }
        );
    }

    const sets = winnerTeam === 1 ? { t1: 2, t2: 0 } : { t1: 0, t2: 2 };
    const setScores =
        winnerTeam === 1
            ? [
                { t1: 6, t2: 4 },
                { t1: 6, t2: 3 },
            ]
            : [
                { t1: 4, t2: 6 },
                { t1: 3, t2: 6 },
            ];

    const { data: currentRow } = await supabase
        .from('tournament_matches')
        .select('data')
        .eq('tournament_id', tournamentId)
        .eq('id', matchId)
        .single();

    const merged = {
        ...(currentRow?.data as object || {}),
        sets,
        setScores,
        games: { t1: 12, t2: 9 },
        points: { t1: '0', t2: '0' },
        status: MatchStatus.FINISHED,
        finishedAt: now(),
    };

    const { error: updateErr } = await supabase
        .from('tournament_matches')
        .update({ data: merged, updated_at: now() })
        .eq('tournament_id', tournamentId)
        .eq('id', matchId);

    if (updateErr) {
        return NextResponse.json(
            { error: 'No se pudo guardar el resultado' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
