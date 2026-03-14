import { NextResponse } from 'next/server';
import { requireAuth, getAuthUserWithRole } from '@/lib/authServerSupabase';
import { dataService } from '@/lib/dataService';

export async function POST(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const authResult = await requireAuth(_req);
    if (authResult instanceof NextResponse) return authResult;
    const uid = authResult.uid;

    const { id: tournamentId } = await params;
    if (!tournamentId) {
        return NextResponse.json({ error: 'ID de torneo requerido' }, { status: 400 });
    }

    try {
        const tournament = await dataService.getTournament(tournamentId);
        if (!tournament) {
            return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
        }

        const userWithRole = await getAuthUserWithRole(_req);
        const isAdmin = userWithRole?.role === 'admin';
        const isOwner =
            tournament.ownerId === uid ||
            (tournament as any).createdBy === uid ||
            (Array.isArray((tournament as any).owners) && (tournament as any).owners.includes(uid));

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: 'No tienes permiso para sincronizar este torneo' }, { status: 403 });
        }

        const result = await dataService.syncAcceptedTeamsToTournament(tournamentId);
        return NextResponse.json({
            success: true,
            synced: result.synced,
            errors: result.errors,
        });
    } catch (err: any) {
        console.error('[sync-accepted-teams]', err);
        return NextResponse.json(
            { error: err?.message || 'Error al sincronizar parejas aceptadas' },
            { status: 500 }
        );
    }
}
