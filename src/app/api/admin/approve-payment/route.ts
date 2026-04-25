import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { sendCeoTournamentFullAlert } from '@/services/whatsappService';
import { sanitizeString } from '@/lib/apiValidation';

const PLAYER_CAP = 16;

/**
 * Suma "jugadores" a partir de inscripciones con pago aprobado: 1 en individual, 2 si hay pareja
 * (columna `partner_id` o datos de pareja en `data`).
 */
function playerSlotsForInscriptionRow(r: { data?: unknown; partner_id?: string | null }): number {
  const d = (r.data || {}) as Record<string, unknown>;
  const hasPair =
    (r.partner_id != null && String(r.partner_id).trim() !== '') ||
    (d.partnerId != null && String(d.partnerId).trim() !== '') ||
    (typeof d.partnerName === 'string' && d.partnerName.trim() !== '');
  return hasPair ? 2 : 1;
}

type Body = { tournamentId?: string };

/**
 * Tras marcar un pago como aprobado (`inscriptions.payment_status = 'paid'`), el admin llama a esta ruta
 * para: comprobar si se alcanzó el cupo (16 jugadores = 8 parejas), notificar al CEO y cerrar inscripciones.
 *
 * No usa `payment_logs.status = 'APPROVED'`: en este proyecto el criterio de “aprobado” es el estado
 * de la inscripción; `payment_logs` se usa en otro flujo (Pago Móvil / referencia).
 */
export async function POST(request: Request) {
  const auth = await requireRole(request, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 503 }
    );
  }

  try {
    const json = (await request.json()) as Body;
    const tournamentId = sanitizeString(json?.tournamentId);
    if (!tournamentId) {
      return NextResponse.json({ error: 'Falta tournamentId' }, { status: 400 });
    }

    const { data: trow, error: tErr } = await supabase
      .from('tournaments')
      .select('id, data')
      .eq('id', tournamentId)
      .maybeSingle();
    if (tErr) {
      return NextResponse.json({ error: tErr.message }, { status: 500 });
    }
    if (!trow) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 });
    }

    const existing = ((trow as { data?: Record<string, unknown> }).data || {}) as Record<string, unknown>;
    if (existing.ceoCapAlertSentAt) {
      return NextResponse.json({
        ok: true,
        capReached: true,
        alreadyNotified: true,
        playerSlots: null,
        registrationStatus: (existing.registrationStatus as string) || 'open',
      });
    }

    const { data: insRows, error: insErr } = await supabase
      .from('inscriptions')
      .select('id, data, partner_id, payment_status')
      .eq('tournament_id', tournamentId)
      .eq('payment_status', 'paid');
    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    const rows = insRows || [];
    const playerSlots = rows.reduce(
      (acc, r) => acc + playerSlotsForInscriptionRow(r as { data?: unknown; partner_id?: string | null }),
      0
    );

    if (playerSlots < PLAYER_CAP) {
      return NextResponse.json({
        ok: true,
        capReached: false,
        playerSlots,
        required: PLAYER_CAP,
      });
    }

    const tournamentName =
      (typeof existing.name === 'string' && existing.name.trim()) || 'Pampatar Beta Test';
    const wa = await sendCeoTournamentFullAlert({ tournamentName });

    const nowIso = new Date().toISOString();
    const nextData: Record<string, unknown> = {
      ...existing,
      registrationStatus: 'closed',
      soldOutByPlayerCap: true,
      soldOutAt: nowIso,
      ceoCapAlertSentAt: nowIso,
    };

    const { error: upErr } = await supabase
      .from('tournaments')
      .update({ data: nextData, updated_at: nowIso })
      .eq('id', tournamentId);
    if (upErr) {
      console.error('[approve-payment] No se pudo cerrar inscripciones en torneo:', upErr);
    }

    return NextResponse.json({
      ok: true,
      capReached: true,
      playerSlots,
      required: PLAYER_CAP,
      whatsapp: wa.success ? { sent: true, sid: wa.sid } : { sent: false, error: wa.error },
      tournamentUpdated: !upErr,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error interno';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
