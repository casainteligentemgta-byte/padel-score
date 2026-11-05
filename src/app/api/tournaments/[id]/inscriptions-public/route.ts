import { NextResponse } from 'next/server';
import { validateTournamentId } from '@/lib/apiValidation';
import { mapPublicInscriptionRow } from '@/lib/publicInscriptions';
import { getSupabaseAnonServerClient, getSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Roster público de un torneo: nombres, grupo y categoría.
 * Sin email, teléfono, pago ni recibo.
 */
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const idValidation = validateTournamentId(id);
    if (idValidation.error) {
        return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    const service = getSupabaseServiceClient();
    if (service) {
        const { data, error } = await service
            .from('inscriptions')
            .select('id, tournament_id, category_key, participant_name, group_name, is_placeholder, inscription_status, data')
            .eq('tournament_id', id);
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({
            inscriptions: (data || []).map((row) => mapPublicInscriptionRow(row as Record<string, unknown>)),
        });
    }

    const anon = getSupabaseAnonServerClient();
    if (!anon) {
        return NextResponse.json({ error: 'Supabase no configurado' }, { status: 503 });
    }
    const { data, error } = await anon.rpc('list_tournament_inscriptions_public', {
        p_tournament_id: id,
    });
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({
        inscriptions: (data || []).map((row: Record<string, unknown>) => mapPublicInscriptionRow(row)),
    });
}
