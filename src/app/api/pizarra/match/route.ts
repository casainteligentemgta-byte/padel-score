import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Snapshot del partido para pizarra/TV sin depender del cliente anónimo (RLS).
 * Si falta SERVICE_ROLE_KEY, devuelve 501 y la pizarra usa getMatchById en cliente.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tournamentId = searchParams.get('tournamentId')?.trim();
  const matchId = searchParams.get('matchId')?.trim();
  if (!tournamentId || !matchId) {
    return NextResponse.json({ error: 'tournamentId y matchId son obligatorios' }, { status: 400 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Servidor sin SUPABASE_SERVICE_ROLE_KEY' }, { status: 501 });
  }

  const { data, error } = await supabase
    .from('tournament_matches')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('id', matchId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 });
  }

  const r = data as Record<string, unknown> & { data?: Record<string, unknown>; id: string };
  const match = {
    ...(typeof r.data === 'object' && r.data ? r.data : {}),
    ownerId: (r as { owner_id?: string }).owner_id,
    createdAt: (r as { created_at?: string }).created_at,
    updatedAt: (r as { updated_at?: string }).updated_at,
    id: r.id,
  };

  return NextResponse.json({ match }, { headers: { 'Cache-Control': 'no-store' } });
}
