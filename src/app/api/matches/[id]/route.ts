import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { MatchStatus } from '@/types/tournament';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status, score, actualStartTime, actualEndTime } = await req.json();

        // 1. Actualizar el match actual
        const updatedMatch = await prisma.match.update({
            where: { id },
            data: {
                status: status as any,
                score,
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
