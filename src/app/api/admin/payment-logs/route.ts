import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  const { data, error } = await supabase
    .from('payment_logs')
    .select('id, owner_id, user_id, tournament_id, reference_number, bank_origin, phone_emitter, amount_bs, status, created_at')
    .order('created_at', { ascending: false })
    .limit(120);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data || [];
  const profileIds = [...new Set(rows.map((r: any) => String(r.user_id || r.owner_id || '')).filter(Boolean))];
  const profileById: Record<string, { name: string | null; full_name: string | null; email: string | null }> = {};

  if (profileIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email')
      .in('id', profileIds);
    (profiles || []).forEach((p: any) => {
      profileById[String(p.id)] = {
        name: p?.name ?? null,
        full_name: p?.name ?? null,
        email: p?.email ?? null,
      };
    });
  }

  const mapped = rows.map((r: any) => {
    const uid = String(r.user_id || r.owner_id || '');
    return {
      ...r,
      profiles: profileById[uid] || null,
    };
  });

  return NextResponse.json(mapped);
}

export async function PATCH(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  let body: { id?: string; status?: 'pending' | 'paid' | 'alert' } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const id = String(body.id || '').trim();
  const status = String(body.status || '').trim().toLowerCase();
  if (!id) return NextResponse.json({ error: 'Falta id.' }, { status: 400 });
  if (!['pending', 'paid', 'alert'].includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('payment_logs')
    .update({ status, updated_at: new Date().toISOString() } as any)
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

