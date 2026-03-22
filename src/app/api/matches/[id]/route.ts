import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { MatchStatus } from '@/types/tournament';
import { requireRole } from '@/lib/authServerSupabase';
import { validateMatchBody, validateMatchId, sanitizeString } from '@/lib/apiValidation';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireRole(req, ['admin', 'marker']);
    if (authResult instanceof NextResponse) return authResult;
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

        // 1. Actualizar el match actual
        const updatedMatch = await prisma.match.update({
            where: { id },
            data: {
                status: status as any,
                score: sanitizeString(score),
                actualStartTime: actualStartTime ? new Date(actualStartTime) : undefined,
                actualEndTime: actualEndTime ? new Date(actualEndTime) : undefined,
            },
            include: { tournament: true }
        });

        // 2. Si el match ha terminado, disparamos la auto-corrección
        if (status === MatchStatus.FINISHED) {
            const tournamentId = updatedMatch.tournamentId;
            const bufferMinutes = updatedMatch.tournament.bufferMinutes;

            // Obtener todos los matches del torneo
            const allMatches = await prisma.match.findMany({
                where: { tournamentId },
                orderBy: { scheduledTime: 'asc' }
            });

            // Calcular cambios
            const updates = ScheduleEngine.recalculateRemainingMatches(allMatches, bufferMinutes);

            // Aplicar actualizaciones en lote si hay cambios
            if (updates.length > 0) {
                await Promise.all(
                    updates.map(u =>
                        prisma.match.update({
                            where: { id: u.id },
                            data: { scheduledTime: u.scheduledTime }
                        })
                    )
                );
            }

            return NextResponse.json({
                success: true,
                match: updatedMatch,
                autoCorrectedCount: updates.length
            });
        }

        return NextResponse.json({ success: true, match: updatedMatch });

    } catch (error: any) {
        console.error('Match Update Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
