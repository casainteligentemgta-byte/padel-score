import type { SupabaseClient } from '@supabase/supabase-js';
import { expressVenuePathSlug } from '@/lib/expressShortUrl';
import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';

const AUTH_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export type ClubStaffRow = {
  id: string;
  club_slug: string;
  name: string;
  role_label: string | null;
  auth_code: string;
  telegram_chat_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function randomAuthSuffix(length = 4): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += AUTH_CODE_CHARS[Math.floor(Math.random() * AUTH_CODE_CHARS.length)];
  }
  return out;
}

/** Genera código tipo BD-A7K3 a partir de la sede. */
export function buildClubStaffAuthCode(clubSlug: string): string {
  const venue = resolveCanonicalExpressVenue(clubSlug) ?? clubSlug.trim();
  const prefix = expressVenuePathSlug(venue);
  return `${prefix}-${randomAuthSuffix(4)}`;
}

export async function buildUniqueClubStaffAuthCode(
  supabase: SupabaseClient,
  clubSlug: string,
): Promise<string> {
  for (let i = 0; i < 25; i++) {
    const candidate = buildClubStaffAuthCode(clubSlug);
    const { data } = await supabase
      .from('club_staff')
      .select('id')
      .eq('auth_code', candidate)
      .maybeSingle();
    if (!data) return candidate;
  }
  return `${buildClubStaffAuthCode(clubSlug)}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

/** Evita que un mismo chat quede en varios registros staff. */
export async function linkClubStaffTelegramChat(
  supabase: SupabaseClient,
  staffId: string,
  telegramChatId: number,
): Promise<void> {
  await supabase
    .from('club_staff')
    .update({ telegram_chat_id: null })
    .eq('telegram_chat_id', telegramChatId)
    .neq('id', staffId);

  await supabase.from('club_staff').update({ telegram_chat_id: telegramChatId }).eq('id', staffId);
}

export async function findActiveClubStaffByTelegramChat(
  supabase: SupabaseClient,
  telegramChatId: number,
): Promise<ClubStaffRow | null> {
  const { data } = await supabase
    .from('club_staff')
    .select('*')
    .eq('telegram_chat_id', telegramChatId)
    .eq('is_active', true)
    .maybeSingle();
  return (data as ClubStaffRow | null) ?? null;
}

export function buildTelegramLoginInstruction(authCode: string): string {
  const bot = process.env.TELEGRAM_BOT_USERNAME?.trim();
  const botHint = bot ? `@${bot.replace(/^@/, '')}` : 'el bot de Smart Padel';
  return `En Telegram, abre ${botHint} y envía:\n\`/login ${authCode}\``;
}

export function buildStaffAuthCodeLabel(clubSlug: string, authCode: string): string {
  const venue = resolveCanonicalExpressVenue(clubSlug) ?? clubSlug;
  const code = expressVenuePathSlug(venue);
  return `${venue} (${code}) · ${authCode}`;
}
