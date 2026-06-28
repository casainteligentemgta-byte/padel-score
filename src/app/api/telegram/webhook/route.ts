import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { answerTelegramCallbackQuery, sendTelegramMessage } from '@/lib/telegramBot';
import { expressCanchaCodeFromCourtNumber } from '@/lib/tvDeviceAuth';

const QR_WINDOW_MS = 60_000;

async function buildStaffKeyboard(supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>, clubSlug: string) {
  const { data: devices } = await supabase
    .from('tv_devices')
    .select('court_number')
    .eq('club_slug', clubSlug)
    .eq('is_authorized', true)
    .order('court_number');

  const courts =
    devices?.map((d) => String(d.court_number)).filter(Boolean) ??
    ['1', '2', '3', '4'];

  const unique = Array.from(new Set(courts));

  return {
    inline_keyboard: unique.map((courtNumber) => [
      {
        text: `🎾 Habilitar Cancha ${courtNumber}`,
        callback_data: `activate_${courtNumber}`,
      },
    ]),
  };
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json();

    if (body.message?.text) {
      const chatId = body.message.chat.id as number;
      const text = String(body.message.text).trim();

      if (text.startsWith('/login')) {
        const authCode = text.split(/\s+/)[1]?.trim().toUpperCase();

        if (!authCode) {
          await sendTelegramMessage(chatId, '❌ Formato incorrecto. Usa: `/login CODIGO`');
          return NextResponse.json({ ok: true });
        }

        const { data: staff, error } = await supabase
          .from('club_staff')
          .select('*')
          .eq('auth_code', authCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error || !staff) {
          await sendTelegramMessage(chatId, '❌ Código inválido o inactivo.');
          return NextResponse.json({ ok: true });
        }

        await supabase
          .from('club_staff')
          .update({ telegram_chat_id: chatId })
          .eq('id', staff.id);

        const keyboard = await buildStaffKeyboard(supabase, String(staff.club_slug));

        await sendTelegramMessage(
          chatId,
          `✅ *Bienvenido ${staff.name}*\nSede vinculada: \`${staff.club_slug}\`\n\nToca un botón para mostrar el QR en la pantalla durante 1 minuto:`,
          keyboard,
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const chatId = callbackQuery.message?.chat?.id as number | undefined;
      const data = String(callbackQuery.data ?? '');

      if (!chatId) {
        return NextResponse.json({ ok: true });
      }

      const { data: staff } = await supabase
        .from('club_staff')
        .select('club_slug, name')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .maybeSingle();

      if (!staff) {
        await answerTelegramCallbackQuery(callbackQuery.id, 'No estás autorizado.');
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith('activate_')) {
        const courtNumber = data.replace('activate_', '');
        const canchaCode = expressCanchaCodeFromCourtNumber(courtNumber);

        if (!canchaCode) {
          await answerTelegramCallbackQuery(callbackQuery.id, 'Cancha inválida.');
          return NextResponse.json({ ok: true });
        }

        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + QR_WINDOW_MS).toISOString();

        const { data: existing } = await supabase
          .from('express_matches')
          .select('id')
          .eq('cancha_code', canchaCode)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabase.from('express_matches').insert([
            {
              cancha_code: canchaCode,
              session_id: sessionId,
              base_venue: staff.club_slug,
              qr_expires_at: expiresAt,
              is_active: false,
            },
          ]);
          if (insertError) {
            console.error('[telegram/webhook] insert express_match:', insertError);
            await answerTelegramCallbackQuery(callbackQuery.id, 'Error al activar la cancha.');
            return NextResponse.json({ ok: true });
          }
        } else {
          const { error: updateError } = await supabase
            .from('express_matches')
            .update({
              session_id: sessionId,
              qr_expires_at: expiresAt,
              base_venue: staff.club_slug,
              is_active: false,
            })
            .eq('cancha_code', canchaCode);

          if (updateError) {
            console.error('[telegram/webhook] update express_match:', updateError);
            await answerTelegramCallbackQuery(callbackQuery.id, 'Error al activar la cancha.');
            return NextResponse.json({ ok: true });
          }
        }

        await answerTelegramCallbackQuery(
          callbackQuery.id,
          `✅ Cancha ${courtNumber} activada por 1 min`,
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[telegram/webhook]', error);
    return NextResponse.json({ ok: true });
  }
}
