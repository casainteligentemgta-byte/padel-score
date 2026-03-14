import { NextResponse } from 'next/server';
import { sendCEOMessage } from '@/lib/ceo-messenger';

const PADEL_LOG = '[Smart Padel · CEO Webhook]';

/** GET: verificación de URL (p. ej. Supabase). Solo POST procesa eventos. */
export async function GET() {
  return NextResponse.json({
    service: 'smartpadel-ceo-webhook',
    message: 'Usa POST con el payload de Supabase Database Webhook.',
  });
}

/** Payload típico de Supabase Database Webhook */
type SupabaseWebhookPayload = {
  type?: 'INSERT' | 'UPDATE' | 'DELETE';
  table?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown>;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SupabaseWebhookPayload;
    const { table, record = {}, type } = body;

    if (!table || !type) {
      console.warn(`${PADEL_LOG} ⚠️ Body inválido: falta table o type.`);
      return NextResponse.json({ ok: false, reason: 'missing_table_or_type' }, { status: 400 });
    }

    console.log(`${PADEL_LOG} 📥 Evento recibido: table=${table}, type=${type}`);

    let message: string | null = null;

    switch (table) {
      case 'participants': {
        if (type === 'INSERT') {
          const data = (record as { data?: Record<string, unknown> }).data ?? record;
          const name = [data?.name, data?.lastName].filter(Boolean).join(' ').trim() || 'Nuevo jugador';
          message = `🎾 *Smart Padel – Nuevo jugador registrado*\n\n👤 ${name}\n\nSe ha creado una nueva ficha en el sistema.`;
          console.log(`${PADEL_LOG} ✅ participants INSERT → mensaje construido.`);
        }
        break;
      }

      case 'tournament_matches': {
        if (type === 'UPDATE') {
          const data = (record as { data?: Record<string, unknown> }).data ?? record;
          const status = data?.status as string | undefined;
          if (status === 'FINISHED') {
            const score = (data?.score as string) || (data?.sets ? `${(data.sets as { t1?: number }).t1 ?? 0}-${(data.sets as { t2?: number }).t2 ?? 0}` : '–');
            const team1 = (data?.team1Name as string) || (data?.team1 as string) || 'Equipo 1';
            const team2 = (data?.team2Name as string) || (data?.team2 as string) || 'Equipo 2';
            message = `🏆 *Smart Padel – Partido finalizado*\n\n${team1} *${score}* ${team2}\n\nEl marcador ya está actualizado en las pantallas.`;
            console.log(`${PADEL_LOG} ✅ tournament_matches UPDATE (FINISHED) → mensaje construido.`);
          }
        }
        break;
      }

      default:
        console.log(`${PADEL_LOG} ⏭️ Tabla "${table}" sin acción configurada.`);
    }

    if (!message) {
      return NextResponse.json({ ok: true, skipped: true, table, type }, { status: 200 });
    }

    const result = await sendCEOMessage(message);
    if (!result.success) {
      console.error(`${PADEL_LOG} ❌ Fallo al enviar mensaje CEO:`, result.error);
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`${PADEL_LOG} ✅ Webhook procesado y mensaje enviado. SID: ${result.sid ?? 'n/a'}`);
    return NextResponse.json({ ok: true, sid: result.sid }, { status: 200 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`${PADEL_LOG} ❌ Error inesperado:`, errorMessage);
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}
