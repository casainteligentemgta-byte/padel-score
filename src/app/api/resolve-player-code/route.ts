import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { checkRateLimit } from '@/lib/rateLimit';

const CODE_RE = /^[A-Z0-9]{6}$/;

/**
 * Resuelve un código de 6 caracteres a id + nombre visible (sin email ni rol).
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  if (!checkRateLimit(req, { max: 20, windowMs: 60_000, bucket: 'lookup-code' })) {
    return NextResponse.json({ error: 'Demasiadas búsquedas. Intenta más tarde.' }, { status: 429 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  const raw = new URL(req.url).searchParams.get('code')?.trim().toUpperCase().replace(/\s/g, '') || '';
  if (!CODE_RE.test(raw)) {
    return NextResponse.json({ error: 'Código inválido.' }, { status: 400 });
  }

  const { data, error } = await supabase.rpc('lookup_profile_by_unique_code', { p_code: raw });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) {
    return NextResponse.json({ error: 'Código no encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    id: row.id,
    name: row.display_name || 'Jugador',
  });
}
