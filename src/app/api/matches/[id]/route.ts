import { NextResponse } from 'next/server';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { MatchStatus } from '@/types/tournament';
import { requireRole } from '@/lib/authServerSupabase';
import { validateMatchBody, validateMatchId, sanitizeString } from '@/lib/apiValidation';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { syncMatchOrderFields } from '@/lib/matchOrderMeta';

/**
 * PATCH de partido sobre `tournament_matches` (Supabase). Prisma ya no se usa.
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireRole(req, ['admin', 'marker']);
    if (authResult instanceof NextResponse) return authResult;

    const supabase = getSupabaseServiceClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }

    try {
        const { id } = await params;
        const idValidation = validateMatchId(id);
        if (idValidation.error) {
            return NextResponse.json({ error: idValidation.error }, { status: 400 });
        }
        const body = await req.json();
        const bodyValidation = validateMatchBody(body);
        if (bodyValidation.error) {
            return NextResponse.json({ error: bodyValidation.error }, { status: 400 });
        }
        const { status, score, actualStartTime, actualEndTime } = body;

        const { data: existing, error: findErr } = await supabase
            .from('tournament_matches')
            .select('id, tournament_id, data')
            .eq('id', id)
            .maybeSingle();
        if (findErr) {
            return NextResponse.json({ error: findErr.message }, { status: 500 });
        }
        if (!existing) {
            return NextResponse.json({ error: 'Match no encontrado' }, { status: 404 });
        }

        const current = ((existing as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>;
        const currentStatus = String(current.status || '');
        if (currentStatus === MatchStatus.FINISHED || currentStatus === 'FINISHED') {
            return NextResponse.json(
                { error: 'El partido ya está FINISHED y no admite cambios.' },
                { status: 409 }
            );
        }

        const merged = syncMatchOrderFields({
            ...current,
            status: status as string,
            score: sanitizeString(score),
            actualStartTime: actualStartTime ? new Date(actualStartTime).toISOString() : current.actualStartTime,
            actualEndTime: actualEndTime ? new Date(actualEndTime).toISOString() : current.actualEndTime,
            id,
        });
        delete (merged as { id?: string }).id;

        const { error: upErr } = await supabase
            .from('tournament_matches')
            .update({ data: merged, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (upErr) {
            return NextResponse.json({ error: upErr.message }, { status: 500 });
        }

        if (status === MatchStatus.FINISHED) {
            const tournamentId = String((existing as { tournament_id: string }).tournament_id);
            const { data: trow } = await supabase
                .from('tournaments')
                .select('data')
                .eq('id', tournamentId)
                .maybeSingle();
            const bufferMinutes = Number((trow as { data?: { bufferMinutes?: number } } | null)?.data?.bufferMinutes) || 15;

            const { data: allRows } = await supabase
                .from('tournament_matches')
                .select('id, data')
                .eq('tournament_id', tournamentId);

            const allMatches = (allRows || []).map((r) => {
                const d = ((r as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>;
                return {
                    id: String((r as { id: string }).id),
                    status: d.status,
                    courtIndex: d.courtIndex,
                    courtId: d.courtId,
                    scheduledTime: d.scheduledTime ? new Date(String(d.scheduledTime)) : new Date(),
                };
            });

            const updates = ScheduleEngine.recalculateRemainingMatches(allMatches as never, bufferMinutes);
            for (const u of updates) {
                const row = (allRows || []).find((r) => String((r as { id: string }).id) === u.id);
                const d = { ...((((row as { data?: Record<string, unknown> } | undefined)?.data) || {})), scheduledTime: u.scheduledTime };
                await supabase
                    .from('tournament_matches')
                    .update({ data: d, updated_at: new Date().toISOString() })
                    .eq('id', u.id);
            }

            return NextResponse.json({
                success: true,
                match: { id, ...merged },
                autoCorrectedCount: updates.length,
            });
        }

        return NextResponse.json({ success: true, match: { id, ...merged } });
    } catch (error: unknown) {
        console.error('Match Update Error:', error);
        const message = error instanceof Error ? error.message : 'Error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
