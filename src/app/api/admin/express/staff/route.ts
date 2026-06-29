import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import {
  buildUniqueClubStaffAuthCode,
  type ClubStaffRow,
} from '@/lib/expressClubStaff';
import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

function isNextResponse(value: unknown): value is NextResponse {
  return value instanceof NextResponse;
}

function sanitizeName(value: unknown): string {
  return String(value ?? '').trim();
}

export async function GET(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (isNextResponse(auth)) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const clubFilter = sanitizeName(searchParams.get('club'));

  let query = supabase
    .from('club_staff')
    .select('*')
    .order('club_slug', { ascending: true })
    .order('name', { ascending: true });

  if (clubFilter) {
    const canonical = resolveCanonicalExpressVenue(clubFilter) ?? clubFilter;
    query = query.eq('club_slug', canonical);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin/express/staff] GET:', error);
    return NextResponse.json({ error: 'No se pudo cargar el staff.' }, { status: 500 });
  }

  return NextResponse.json({ staff: (data ?? []) as ClubStaffRow[] });
}

export async function POST(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (isNextResponse(auth)) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const name = sanitizeName(body.name);
  const roleLabel = sanitizeName(body.role_label) || null;
  const clubSlug = resolveCanonicalExpressVenue(sanitizeName(body.club_slug)) ?? sanitizeName(body.club_slug);

  if (!name || !clubSlug) {
    return NextResponse.json({ error: 'Nombre y sede son obligatorios.' }, { status: 400 });
  }

  const authCode = await buildUniqueClubStaffAuthCode(supabase, clubSlug);

  const { data, error } = await supabase
    .from('club_staff')
    .insert({
      club_slug: clubSlug,
      name,
      role_label: roleLabel,
      auth_code: authCode,
      is_active: true,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[admin/express/staff] POST:', error);
    return NextResponse.json({ error: 'No se pudo crear el manejador.' }, { status: 500 });
  }

  return NextResponse.json({ staff: data as ClubStaffRow });
}

export async function PATCH(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (isNextResponse(auth)) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const id = sanitizeName(body.id);
  if (!id) {
    return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = sanitizeName(body.name);
    if (!name) return NextResponse.json({ error: 'Nombre inválido.' }, { status: 400 });
    updates.name = name;
  }

  if (body.role_label !== undefined) {
    updates.role_label = sanitizeName(body.role_label) || null;
  }

  if (body.club_slug !== undefined) {
    const clubSlug =
      resolveCanonicalExpressVenue(sanitizeName(body.club_slug)) ?? sanitizeName(body.club_slug);
    if (!clubSlug) return NextResponse.json({ error: 'Sede inválida.' }, { status: 400 });
    updates.club_slug = clubSlug;
  }

  if (body.is_active !== undefined) {
    updates.is_active = Boolean(body.is_active);
  }

  if (body.regenerate_code === true) {
    const { data: existing } = await supabase.from('club_staff').select('club_slug').eq('id', id).maybeSingle();
    if (!existing?.club_slug) {
      return NextResponse.json({ error: 'Manejador no encontrado.' }, { status: 404 });
    }
    updates.auth_code = await buildUniqueClubStaffAuthCode(supabase, String(existing.club_slug));
    updates.telegram_chat_id = null;
  }

  if (body.unlink_telegram === true) {
    updates.telegram_chat_id = null;
  }

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'Sin cambios.' }, { status: 400 });
  }

  const { data, error } = await supabase.from('club_staff').update(updates).eq('id', id).select('*').single();

  if (error) {
    console.error('[admin/express/staff] PATCH:', error);
    return NextResponse.json({ error: 'No se pudo actualizar.' }, { status: 500 });
  }

  return NextResponse.json({ staff: data as ClubStaffRow });
}

export async function DELETE(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (isNextResponse(auth)) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase no configurado.' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = sanitizeName(searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'ID requerido.' }, { status: 400 });
  }

  const { error } = await supabase.from('club_staff').delete().eq('id', id);
  if (error) {
    console.error('[admin/express/staff] DELETE:', error);
    return NextResponse.json({ error: 'No se pudo eliminar.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
