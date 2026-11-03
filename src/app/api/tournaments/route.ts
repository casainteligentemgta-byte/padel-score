import { NextResponse } from 'next/server';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { TournamentType } from '@/types/tournament';
import { requireAuth } from '@/lib/authServerSupabase';
import { validateTournamentBody, sanitizeString } from '@/lib/apiValidation';
import { checkRateLimit } from '@/lib/rateLimit';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    if (!checkRateLimit(req)) {
        return NextResponse.json({ error: 'Demasiadas peticiones. Intenta más tarde.' }, { status: 429 });
    }
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    try {
        const body = await req.json();
        const validation = validateTournamentBody(body);
        if (validation.error) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        const {
            name,
            type,
            category,
            startDate,
            clubHoursStart,
            clubHoursEnd,
            teamIds,
            totalCourts,
            bufferMinutes,
        } = body;

        const sStart = sanitizeString(clubHoursStart || '08:00');
        const sEnd = sanitizeString(clubHoursEnd || '23:00');
        const schedule = ScheduleEngine.generateSchedule({
            tournamentId: 'temp',
            numTeams: Array.isArray(teamIds) ? teamIds.length : 0,
            numCourts: totalCourts || 4,
            clubHoursStart: sStart,
            clubHoursEnd: sEnd,
            type: type as TournamentType,
            matchDurationMinutes: 90,
            bufferMinutes: bufferMinutes || 15,
            startDate: new Date(startDate),
        });

        const supabase = getSupabaseServiceClient();
        if (!supabase) {
            return NextResponse.json({
                success: true,
                demo: true,
                tournament: { id: 'demo-' + Date.now(), name, type, category },
                matchesCount: schedule.matches.length,
                info: schedule,
            });
        }

        const nowIso = new Date().toISOString();
        const tournamentData = {
            name: sanitizeString(name),
            type,
            category,
            startDate,
            clubHoursStart: sStart,
            clubHoursEnd: sEnd,
            bufferMinutes: bufferMinutes || 15,
            numCourts: totalCourts || 4,
        };

        const { data: trow, error: tErr } = await supabase
            .from('tournaments')
            .insert({
                owner_id: authResult.uid,
                data: tournamentData,
                created_at: nowIso,
                updated_at: nowIso,
            })
            .select('id')
            .single();
        if (tErr || !trow) {
            return NextResponse.json({ error: tErr?.message || 'No se pudo crear el torneo' }, { status: 500 });
        }

        const tournamentId = String((trow as { id: string }).id);
        const matchRows = schedule.matches.map((m: { courtIndex?: number; team1Index?: number; team2Index?: number; scheduledTime?: Date; status?: string }, i: number) => ({
            tournament_id: tournamentId,
            owner_id: authResult.uid,
            data: {
                courtIndex: m.courtIndex,
                team1Index: m.team1Index,
                team2Index: m.team2Index,
                scheduledTime: m.scheduledTime,
                status: m.status || 'PENDING',
                match_number: i + 1,
            },
            created_at: nowIso,
            updated_at: nowIso,
        }));

        if (matchRows.length > 0) {
            const { error: mErr } = await supabase.from('tournament_matches').insert(matchRows);
            if (mErr) {
                return NextResponse.json({ error: mErr.message }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            tournament: { id: tournamentId, ...tournamentData },
            matchesCount: matchRows.length,
            info: schedule,
        });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: error instanceof Error ? error.message : undefined,
        }, { status: 500 });
    }
}
