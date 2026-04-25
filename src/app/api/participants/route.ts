import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/authServerSupabase';

/** Quita fotos data:URL muy grandes del JSON del listado (pesan en red y bloquean el parseo/render). */
function pickParticipantListData(data: Record<string, unknown> | null | undefined) {
  const d = (data || {}) as Record<string, unknown>;
  const picked: Record<string, unknown> = {
    name: d.name ?? null,
    lastName: d.lastName ?? null,
    fullName: d.fullName ?? null,
    uniqueCode: d.uniqueCode ?? null,
    level: d.level ?? null,
    position: d.position ?? null,
    dni: d.dni ?? null,
    birthDate: d.birthDate ?? null,
    email: d.email ?? null,
    phone: d.phone ?? null,
    whatsapp: d.whatsapp ?? null,
    instagram: d.instagram ?? null,
    suitSize: d.suitSize ?? null,
    shortSize: d.shortSize ?? null,
    shoeSize: d.shoeSize ?? null,
    bloodType: d.bloodType ?? null,
    allergies: d.allergies ?? null,
    medicalConditions: d.medicalConditions ?? null,
  };

  // En listados evitamos cargar fotos base64 (data URL) para no saturar el payload.
  const photo = d.photo;
  if (typeof photo === 'string' && !photo.startsWith('data:')) {
    picked.photo = photo;
  }
  return picked;
}

/**
 * GET: lista todos los participantes (jugadores) del sistema.
 * Usa service role para evitar restricciones RLS; así el admin puede ver la lista en /players.
 */
export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 501 }
      );
    }

    const { data, error } = await supabase
      .from('participants')
      .select('id, owner_id, data, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(2000);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = data || [];
    const ownersMissingCodeOrAvatar = new Set<string>();
    for (const r of rows as any[]) {
      if (!r?.owner_id) continue;
      const light = pickParticipantListData(r.data);
      const hasCode = typeof light.uniqueCode === 'string' && light.uniqueCode.trim() !== '';
      const hasAvatar = typeof light.photo === 'string' && light.photo.trim() !== '';
      if (!hasCode || !hasAvatar) {
        ownersMissingCodeOrAvatar.add(String(r.owner_id));
      }
    }

    let codeByOwner: Record<string, string> = {};
    let avatarByOwner: Record<string, string> = {};
    if (ownersMissingCodeOrAvatar.size > 0) {
      const profileIds = [...ownersMissingCodeOrAvatar];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, unique_code, avatar_url')
        .in('id', profileIds);
      (profiles || []).forEach((p: any) => {
        if (p.unique_code) codeByOwner[p.id] = p.unique_code;
        if (p.avatar_url) avatarByOwner[p.id] = p.avatar_url;
      });
    }

    const list = rows.map((r: any) => {
      const light = pickParticipantListData(r.data);
      const fromRow =
        typeof light.uniqueCode === 'string' && light.uniqueCode.trim()
          ? light.uniqueCode.trim().toUpperCase()
          : null;
      return {
        id: r.id,
        ownerId: r.owner_id,
        uid: r.owner_id,
        ...light,
        photo: light.photo || avatarByOwner[r.owner_id] || null,
        uniqueCode: fromRow || codeByOwner[r.owner_id] || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      };
    });
    return NextResponse.json(list);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
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
