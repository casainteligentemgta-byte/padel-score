import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * GET: lista todos los participantes (jugadores) del sistema.
 * Usa service role para evitar restricciones RLS; así el admin puede ver la lista en /players.
 */
export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const list = (data || []).map((r: any) => ({
    id: r.id,
    ownerId: r.owner_id,
    uid: r.owner_id,
    ...(r.data || {}),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
  return NextResponse.json(list);
}
