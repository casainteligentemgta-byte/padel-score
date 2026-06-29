import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { buildUniqueClubStaffAuthCode, type ClubStaffRow } from '@/lib/expressClubStaff';
import { EXPRESS_VENUE_OPTIONS, resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

/** Crea un encargado por defecto en cada club que aún no tenga manejadores activos. */
export async function POST(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (isNextResponse(auth)) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const onlyClubRaw = String(body.club_slug ?? '').trim();
  const canonical = onlyClubRaw ? resolveCanonicalExpressVenue(onlyClubRaw) : null;

  if (onlyClubRaw && !canonical) {
    return NextResponse.json({ error: 'Sede no reconocida.' }, { status: 400 });
  }

  const venues = canonical ? [canonical] : [...EXPRESS_VENUE_OPTIONS];

  if (!venues.length) {
    return NextResponse.json({ error: 'Sede no reconocida.' }, { status: 400 });
  }

  const created: ClubStaffRow[] = [];
  const skipped: string[] = [];

  for (const venue of venues) {
    const { count, error: countError } = await supabase
      .from('club_staff')
      .select('id', { count: 'exact', head: true })
      .eq('club_slug', venue)
      .eq('is_active', true);

    if (countError) {
      console.error('[admin/express/staff/init] count:', countError);
      return NextResponse.json({ error: 'Error al revisar sedes.' }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      skipped.push(venue);
      continue;
    }

    const authCode = await buildUniqueClubStaffAuthCode(supabase, venue);
    const { data, error } = await supabase
      .from('club_staff')
      .insert({
        club_slug: venue,
        name: 'Encargado pizarras',
        role_label: 'Encargado pizarras',
        auth_code: authCode,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[admin/express/staff/init] insert:', error);
      return NextResponse.json({ error: `No se pudo crear en ${venue}.` }, { status: 500 });
    }

    created.push(data as ClubStaffRow);
  }

  return NextResponse.json({
    created,
    skipped,
    message:
      created.length > 0
        ? `Se crearon ${created.length} manejador(es) por defecto.`
        : 'Todos los clubes seleccionados ya tenían manejadores.',
  });
}
