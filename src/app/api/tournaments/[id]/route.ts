import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/authServerSupabase';
import { validateTournamentId } from '@/lib/apiValidation';

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

        const tournament = await prisma.tournament.findUnique({
            where: { id },
            include: {
                matches: {
                    include: {
                        team1: true,
                        team2: true,
                        court: true
                    },
                    orderBy: {
                        scheduledTime: 'asc'
                    }
                }
            }
        });

        if (!tournament) {
            return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
        }

        console.log(`[GET Tournament] Found ${tournament.matches.length} matches for tournament ${id}`);

        // Transformar matches para el frontend
        const matches = tournament.matches.map(m => {
            const getTeamName = (team: any) => {
                if (team.player1Id.includes(' ') && team.player2Id.includes(' ')) {
                    return `${team.player1Id.split(' ')[1]} / ${team.player2Id.split(' ')[1]}`;
                }
                return `Equipo ${team.id.slice(0, 4)}`;
            };

            return {
                id: m.id,
                team1: { name: getTeamName(m.team1) },
                team2: { name: getTeamName(m.team2) },
                scheduledTime: m.scheduledTime,
                status: m.status,
                courtName: m.court.name
            };
        });

        return NextResponse.json({
            success: true,
            tournament: {
                id: tournament.id,
                name: tournament.name,
                type: tournament.type,
                bufferMinutes: tournament.bufferMinutes
            },
            matches
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Error al obtener el torneo',
            details: error.message
        }, { status: 500 });
    }
}
