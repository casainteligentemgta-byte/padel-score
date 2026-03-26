import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/authServerSupabase';

/** Quita fotos data:URL muy grandes del JSON del listado (pesan en red y bloquean el parseo/render). */
function lightenParticipantData(data: Record<string, unknown> | null | undefined) {
  const d = { ...(data || {}) };
  const photo = d.photo;
  if (typeof photo === 'string' && photo.startsWith('data:') && photo.length > 500000) {
    delete d.photo;
  }
  return d;
}

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
  const rows = data || [];
  const ownerIds = [...new Set(rows.map((r: any) => r.owner_id).filter(Boolean))];
  let codeByOwner: Record<string, string> = {};
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, unique_code')
      .in('id', ownerIds);
    (profiles || []).forEach((p: any) => {
      if (p.unique_code) codeByOwner[p.id] = p.unique_code;
    });
  }
  const list = rows.map((r: any) => {
    const light = lightenParticipantData(r.data);
    const fromRow =
      typeof light.uniqueCode === 'string' && light.uniqueCode.trim()
        ? light.uniqueCode.trim().toUpperCase()
        : null;
    return {
      id: r.id,
      ownerId: r.owner_id,
      uid: r.owner_id,
      ...light,
      uniqueCode: fromRow || codeByOwner[r.owner_id] || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });
  return NextResponse.json(list);
}

/**
 * DELETE: elimina un participante por id (solo administradores).
 * El cliente con sesión no puede borrar filas de otros usuarios por RLS; hace falta service role.
 */
export async function DELETE(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  const id = new URL(req.url).searchParams.get('id')?.trim();
  if (!id) {
    return NextResponse.json({ error: 'Falta el parámetro id.' }, { status: 400 });
  }

  const { error, count } = await supabase
    .from('participants')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (count === 0) {
    return NextResponse.json({ error: 'Participante no encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
