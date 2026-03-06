import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ScheduleEngine } from '@/services/ScheduleEngine';
import { TournamentType, TournamentCategory } from '@/types/tournament';
import { requireAuth } from '@/lib/authServerSupabase';
import { validateTournamentBody } from '@/lib/apiValidation';

export async function POST(req: Request) {
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
            complexId,
            teamIds,
            totalCourts,
            bufferMinutes
        } = body;

        // 1. Generar el calendario primero (para el modo demo y el real)
        const schedule = ScheduleEngine.generateSchedule({
            tournamentId: 'temp',
            numTeams: teamIds.length,
            numCourts: totalCourts || 4,
            clubHoursStart,
            clubHoursEnd,
            type: type as TournamentType,
            matchDurationMinutes: 90,
            bufferMinutes: bufferMinutes || 15,
            startDate: new Date(startDate)
        });

        // 2. MODO DEMO: Si no hay base de datos configurada, devolvemos el éxito simulado
        if (!process.env.DATABASE_URL) {
            console.warn('⚠️ MODO DEMO: Sin DATABASE_URL');
            return NextResponse.json({
                success: true,
                demo: true,
                tournament: { id: 'demo-' + Date.now(), name, type, category },
                matchesCount: schedule.matches.length,
                info: schedule
            });
        }

        // 3. MODO REAL: Con base de datos
        // 3.1 Upsert del complejo basado en el nombre o ID proporcionado
        const complex = await prisma.complex.upsert({
            where: { id: complexId || 'default-complex' },
            update: {
                name: body.complexName || 'Club Padel Default',
                totalCourts: totalCourts || 4
            },
            create: {
                id: complexId || 'default-complex',
                name: body.complexName || 'Club Padel Default',
                location: 'Localización Virtual',
                totalCourts: totalCourts || 4,
                courts: {
                    create: Array.from({ length: totalCourts || 4 }).map((_, i) => ({
                        name: `Pista ${i + 1}`
                    }))
                }
            },
            include: { courts: true }
        });

        // 3.2 Crear el torneo
        const tournament = await prisma.tournament.create({
            data: {
                name,
                type: type as any,
                category: category as any,
                startDate: new Date(startDate),
                endDate: new Date(startDate),
                clubHoursStart,
                clubHoursEnd,
                bufferMinutes: bufferMinutes || 15,
                complex: {
                    connect: { id: complex.id }
                }
            }
        });

        // 3.3 Crear los equipos
        const createdTeams = await Promise.all(
            teamIds.map(() =>
                prisma.team.create({
                    data: {
                        player1Id: 'Player 1',
                        player2Id: 'Player 2',
                        level: 3.5
                    }
                })
            )
        );

        const newTeamIds = createdTeams.map(t => t.id);

        // 3.4 Transformar y guardar los matches
        const matchesToCreate = schedule.matches.map((m: any) => ({
            tournamentId: tournament.id,
            courtId: complex.courts[m.courtIndex]?.id || complex.courts[0].id,
            team1Id: newTeamIds[m.team1Index - 1],
            team2Id: newTeamIds[m.team2Index - 1],
            scheduledTime: m.scheduledTime,
            status: m.status as any
        }));

        await prisma.match.createMany({
            data: matchesToCreate
        });

        return NextResponse.json({
            success: true,
            tournament,
            matchesCount: matchesToCreate.length,
            info: schedule
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Error en el servidor',
            details: error.message
        }, { status: 500 });
    }
}
