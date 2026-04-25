import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { sendPartnerAcceptInviteMessage } from '@/services/whatsappService';
import { sanitizeString } from '@/lib/apiValidation';
import { isTestPartnerUserId } from '@/lib/testPartnerProfile';

type Body = {
  teamId?: string;
  tournamentDisplayName?: string;
  inviterFirstName?: string;
};

async function getPhoneForUser(
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>,
  userId: string
): Promise<string | null> {
  const { data: p } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', userId)
    .maybeSingle();
  const fromProfile = p?.phone != null ? String(p.phone).trim() : '';
  if (fromProfile) return fromProfile;

  const { data: part } = await supabase
    .from('participants')
    .select('data')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const d = (part?.data as { phone?: string } | null) || null;
  const fromPart = d?.phone != null ? String(d.phone).trim() : '';
  return fromPart || null;
}

async function getInviterFirstName(
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>,
  userId: string
): Promise<string> {
  const { data: p } = await supabase
    .from('profiles')
    .select('name, full_name')
    .eq('id', userId)
    .maybeSingle();
  const raw = (p?.full_name || p?.name || 'Jugador') as string;
  const t = String(raw).trim() || 'Jugador';
  return t.split(/\s+/)[0] || 'Jugador';
}

/**
 * POST: el jugador A (quien inscribe) notifica por WhatsApp al B con enlace /accept-invite?teamId=…
 * Requiere que `teamId` sea una fila de `teams` cuyo `player_a_id` sea el usuario autenticado.
 */
export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Body;
    const teamId = sanitizeString(body?.teamId);
    if (!teamId) {
      return NextResponse.json({ error: 'Falta teamId' }, { status: 400 });
    }

    const { data: team, error: tErr } = await supabase
      .from('teams')
      .select('id, player_a_id, player_b_id')
      .eq('id', teamId)
      .maybeSingle();

    if (tErr || !team) {
      return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 });
    }
    if (String((team as { player_a_id: string }).player_a_id) !== auth.uid) {
      return NextResponse.json({ error: 'No puedes enviar este mensaje para otra invitación.' }, { status: 403 });
    }

    const partnerId = String((team as { player_b_id: string }).player_b_id);
    if (isTestPartnerUserId(partnerId)) {
      return NextResponse.json({ success: true, skipped: true, reason: 'test_partner' });
    }

    const phone = await getPhoneForUser(supabase, partnerId);
    if (!phone) {
      return NextResponse.json(
        { error: 'El compañero no tiene teléfono en su perfil o ficha. No se pudo enviar WhatsApp.' },
        { status: 400 }
      );
    }

    const inviterFromBody = sanitizeString(body?.inviterFirstName);
    const inviter =
      inviterFromBody || (await getInviterFirstName(supabase, auth.uid));
    const display = sanitizeString(body?.tournamentDisplayName) || undefined;

    const result = await sendPartnerAcceptInviteMessage({
      toPhone: phone,
      inviterFirstName: inviter,
      teamId: String((team as { id: string }).id),
      tournamentDisplayName: display,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'No se pudo enviar WhatsApp' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, sid: result.sid });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
