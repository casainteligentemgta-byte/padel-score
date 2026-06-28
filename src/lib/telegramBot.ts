const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN?.trim();

function telegramApi(method: string): string | null {
  if (!TELEGRAM_TOKEN) return null;
  return `https://api.telegram.org/bot${TELEGRAM_TOKEN}/${method}`;
}

export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  replyMarkup?: Record<string, unknown>,
): Promise<boolean> {
  const url = telegramApi('sendMessage');
  if (!url) return false;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
      reply_markup: replyMarkup,
    }),
  });
  return res.ok;
}

export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
): Promise<boolean> {
  const url = telegramApi('answerCallbackQuery');
  if (!url) return false;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
  return res.ok;
}

export function isTelegramConfigured(): boolean {
  return Boolean(TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID?.trim());
}

export async function notifyTelegramTvPinRequest(payload: {
  clubSlug: string;
  courtNumber: string;
  pin: string;
}): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!TELEGRAM_TOKEN || !chatId) return;

  const mensaje =
    `📺 *Solicitud de Pantalla Padel Score*\n\n` +
    `🏢 Sede: \`${payload.clubSlug}\`\n` +
    `🎾 Cancha: \`${payload.courtNumber}\`\n\n` +
    `🔐 PIN de Activación: \`${payload.pin}\``;

  await sendTelegramMessage(chatId, mensaje);
}
