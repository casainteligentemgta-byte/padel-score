import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import {
  applyExpressBoardReset,
  applyExpressQrActivation,
  buildExpressStaffTelegramKeyboard,
  resolveExpressCourtNumbersForClub,
} from '@/lib/expressTelegramActions';
import {
  buildExpressTelegramGuideHelp,
  buildExpressTelegramUrlGuide,
} from '@/lib/expressTelegramGuide';
import {
  buildExpressDailyReportMessage,
  buildStaffLoginTelegramMessage,
  expressReportDayBoundsUtc,
  fetchPizarraActivationsForDay,
  logExpressStaffTelegramLogin,
} from '@/lib/expressActivityReport';
import { answerTelegramCallbackQuery, isTelegramGuideChat, notifyTelegramAdmin, sendTelegramMessage } from '@/lib/telegramBot';

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
      const lowerText = text.toLowerCase();

      if (
        isTelegramGuideChat(chatId) &&
        (lowerText === '/urls' ||
          lowerText.startsWith('/urls ') ||
          lowerText === '/guia' ||
          lowerText.startsWith('/guia ') ||
          lowerText === '/help' ||
          lowerText === '/start')
      ) {
        if (lowerText === '/help' || lowerText === '/start') {
          await sendTelegramMessage(chatId, buildExpressTelegramGuideHelp());
          return NextResponse.json({ ok: true });
        }

        const filter = text.replace(/^\/(urls|guia)\s*/i, '').trim();
        const parts = buildExpressTelegramUrlGuide(filter || undefined);
        for (const part of parts) {
          await sendTelegramMessage(chatId, part);
        }
        return NextResponse.json({ ok: true });
      }

      if (isTelegramGuideChat(chatId) && (lowerText === '/informe' || lowerText === '/reporte')) {
        const bounds = expressReportDayBoundsUtc(new Date());
        const rows = await fetchPizarraActivationsForDay(supabase, bounds);
        await sendTelegramMessage(chatId, buildExpressDailyReportMessage(rows, bounds.dayLabel));
        return NextResponse.json({ ok: true });
      }

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

        await logExpressStaffTelegramLogin(supabase, {
          clubSlug: String(staff.club_slug),
          staffName: String(staff.name),
          staffId: String(staff.id),
          telegramChatId: chatId,
        });

        await notifyTelegramAdmin(
          buildStaffLoginTelegramMessage({
            staffName: String(staff.name),
            clubSlug: String(staff.club_slug),
          }),
        );

        const courtNumbers = await resolveExpressCourtNumbersForClub(supabase, String(staff.club_slug));
        const keyboard = buildExpressStaffTelegramKeyboard(courtNumbers);

        await sendTelegramMessage(
          chatId,
          `✅ *Bienvenido ${staff.name}*\nSede vinculada: \`${staff.club_slug}\`\n\nPor cancha:\n• *QR* — muestra el código en la TV (1 min)\n• *Reset* — limpia marcador y vuelve a pantalla de espera`,
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

      const clubSlug = String(staff.club_slug);

      if (data.startsWith('activate_')) {
        const courtNumber = data.replace('activate_', '');
        const result = await applyExpressQrActivation(supabase, clubSlug, courtNumber);
        await answerTelegramCallbackQuery(callbackQuery.id, result.message);
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith('reset_')) {
        const courtNumber = data.replace('reset_', '');
        const result = await applyExpressBoardReset(supabase, clubSlug, courtNumber);
        await answerTelegramCallbackQuery(callbackQuery.id, result.message);
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[telegram/webhook]', error);
    return NextResponse.json({ ok: true });
  }
}
