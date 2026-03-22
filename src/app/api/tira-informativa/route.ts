import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Tira informativa no disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }
  const { data, error } = await supabase
    .from('tira_informativa')
    .select('*')
    .order('orden', { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Tira informativa no disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }
  let body: { mensaje: string; activo?: boolean; orden?: number; pantalla_id?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
  }
  const mensaje = typeof body.mensaje === 'string' ? body.mensaje.trim() : '';
  if (!mensaje) {
    return NextResponse.json({ error: 'mensaje es obligatorio' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('tira_informativa')
    .insert({
      mensaje,
      activo: body.activo ?? true,
      orden: body.orden ?? 0,
      pantalla_id: body.pantalla_id ?? null,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Tira informativa no disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }
  let body: { id: string; orden?: number; pantalla_id?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON inválido' }, { status: 400 });
  }
  if (!body?.id) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });
  }
  const updates: { orden?: number; pantalla_id?: string | null } = {};
  if (typeof body.orden === 'number') updates.orden = body.orden;
  if (body.pantalla_id !== undefined) updates.pantalla_id = body.pantalla_id;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Indica orden o pantalla_id' }, { status: 400 });
  }
  const { error } = await supabase.from('tira_informativa').update(updates).eq('id', body.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Tira informativa no disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'id es obligatorio' }, { status: 400 });
  }
  const { error } = await supabase.from('tira_informativa').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
