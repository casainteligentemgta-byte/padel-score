import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/authServerSupabase';
import {
  isTestPartnerCode,
  TEST_PARTNER_DISPLAY_NAME,
  TEST_PARTNER_EMAIL,
  TEST_PARTNER_USER_ID,
} from '@/lib/testPartnerProfile';

const CODE_RE = /^[A-Z0-9]{6}$/;

function displayNameFromParticipantData(data: Record<string, unknown> | null | undefined): string {
  if (!data || typeof data !== 'object') return 'Jugador';
  const full = String(data.fullName || '').trim();
  if (full) return full;
  const n = [data.name, data.lastName].filter(Boolean).join(' ').trim();
  return n || 'Jugador';
}

/**
 * Resuelve un código de 6 caracteres a un usuario (profiles) o a la cuenta dueña de la ficha (participants).
 * Requiere sesión (mismo patrón que inscripción con pareja).
 */
export async function GET(req: Request) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

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

  if (isTestPartnerCode(raw)) {
    return NextResponse.json({
      id: TEST_PARTNER_USER_ID,
      name: TEST_PARTNER_DISPLAY_NAME,
      email: TEST_PARTNER_EMAIL,
    });
  }

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('unique_code', raw)
    .maybeSingle();

  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }

  if (profile) {
    return NextResponse.json({
      id: profile.id,
      name: profile.name || 'Jugador',
      email: profile.email ?? null,
    });
  }

  const { data: parts, error: partErr } = await supabase
    .from('participants')
    .select('owner_id, data')
    .eq('data->>uniqueCode', raw)
    .limit(1);

  if (partErr) {
    return NextResponse.json({ error: partErr.message }, { status: 500 });
  }

  const row = parts?.[0];
  if (!row) {
    return NextResponse.json({ error: 'No encontrado.' }, { status: 404 });
  }

  const d = (row.data || {}) as Record<string, unknown>;
  return NextResponse.json({
    id: row.owner_id,
    name: displayNameFromParticipantData(d),
    email: (d.email as string) || null,
  });
}
