import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { sanitizeString } from '@/lib/apiValidation';
import { isTestPartnerUserId, TEST_PARTNER_USER_ID } from '@/lib/testPartnerProfile';

type Body = {
  teamId?: string;
  inscriptionId?: string;
};

const nowIso = () => new Date().toISOString();

/**
 * Con compañero de prueba (888888): marca la inscripción como confirmada y la invitación en `teams`
 * sin que el jugador B inicie sesión. Solo el jugador A (autenticado) y solo si el B es el perfil fijo.
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
    const inscriptionId = sanitizeString(body?.inscriptionId);
    if (!teamId || !inscriptionId) {
      return NextResponse.json({ error: 'Faltan teamId o inscriptionId' }, { status: 400 });
    }

    const { data: team, error: tErr } = await supabase
      .from('teams')
      .select(
        'id, status, expires_at, tournament_id, category, player_a_id, player_b_id, tournament_team_id',
      )
      .eq('id', teamId)
      .maybeSingle();
    if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });
    if (!team) return NextResponse.json({ error: 'Equipo/invitación no encontrada' }, { status: 404 });
    if (String((team as { player_a_id: string }).player_a_id) !== auth.uid) {
      return NextResponse.json({ error: 'No eres el titular de esta invitación' }, { status: 403 });
    }
    if (!isTestPartnerUserId(String((team as { player_b_id: string }).player_b_id))) {
      return NextResponse.json(
        { error: 'Solo aplica a la pareja de prueba 888888 (Smart Padel Player Test)' },
        { status: 400 }
      );
    }
    if (
      (team as { status: string }).status === 'pending' &&
      (team as { expires_at: string | null }).expires_at &&
      new Date(String((team as { expires_at: string }).expires_at)) < new Date()
    ) {
      return NextResponse.json({ error: 'La invitación expiró' }, { status: 400 });
    }

    const { data: ins, error: iErr } = await supabase
      .from('inscriptions')
      .select('id, tournament_id, user_id, owner_id, data, partner_id, inscription_status, status')
      .eq('id', inscriptionId)
      .maybeSingle();
    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });
    if (!ins) return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 });
    const row = ins as Record<string, unknown>;
    const d = (row.data || {}) as Record<string, unknown>;
    const partner =
      (row.partner_id != null && String(row.partner_id)) || (d.partnerId != null && String(d.partnerId)) || '';
    if (partner !== TEST_PARTNER_USER_ID) {
      return NextResponse.json(
        { error: 'La inscripción no reserva a la pareja de prueba' },
        { status: 400 }
      );
    }
    if (String(row.tournament_id || '') !== String((team as { tournament_id: string }).tournament_id)) {
      return NextResponse.json({ error: 'Inscripción y equipo no coinciden' }, { status: 400 });
    }

    const insStatus = String(
      (row as { inscription_status?: string; status?: string }).inscription_status ||
        (row as { status?: string }).status ||
        'NORMAL',
    ).toUpperCase();
    if (insStatus === 'CONFIRMED') {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }
    if (insStatus !== 'RESERVED') {
      return NextResponse.json(
        { error: 'La inscripción no está en estado reservada para el compañero' },
        { status: 400 }
      );
    }

    const ts = nowIso();

    if ((team as { status: string }).status === 'pending') {
      const { error: uTeam } = await supabase
        .from('teams')
        .update({ status: 'accepted', updated_at: ts })
        .eq('id', teamId);
      if (uTeam) return NextResponse.json({ error: uTeam.message }, { status: 500 });
    }

    const { error: pr } = await supabase
      .from('inscriptions')
      .update({ status: 'CONFIRMED', confirmed_at: ts, updated_at: ts } as never)
      .eq('id', inscriptionId);
    if (pr) {
      const { error: fb } = await supabase
        .from('inscriptions')
        .update({ inscription_status: 'CONFIRMED', confirmed_at: ts, updated_at: ts } as never)
        .eq('id', inscriptionId);
      if (fb) return NextResponse.json({ error: fb.message || pr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, testPartnerAuto: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
