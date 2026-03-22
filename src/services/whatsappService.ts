/**
 * Mensajería proactiva WhatsApp vía Twilio.
 *
 * ⚠️ Solo usar en servidor (API routes, Server Actions, cron): contiene credenciales vía env
 * y escribe en Supabase con service role.
 */

import Twilio from 'twilio';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

const LOG = '[Smart Padel · WhatsApp]';

export type WhatsNotificationType =
  | 'admin_welcome'
  | 'partner_invitation'
  | 'match_reminder';

export type SendResult = { success: boolean; sid?: string; error?: string };

/** Limpia el número y devuelve la dirección `whatsapp:+E164` que exige Twilio. */
export function normalizeWhatsAppAddress(raw: string): string | null {
  if (!raw || typeof raw !== 'string') return null;
  let s = raw.trim();
  if (s.toLowerCase().startsWith('whatsapp:')) {
    s = s.slice('whatsapp:'.length).trim();
  }
  // Quitar espacios, guiones, paréntesis y otros separadores habituales
  s = s.replace(/[\s\-\(\).]/g, '');
  if (!s) return null;

  let digits: string;
  if (s.startsWith('+')) {
    digits = s.slice(1).replace(/\D/g, '');
    if (!digits) return null;
    s = `+${digits}`;
  } else {
    digits = s.replace(/\D/g, '');
    if (!digits) return null;
    s = `+${digits}`;
  }

  // Mínimo razonable E.164 (código país + número)
  if (s.replace(/\D/g, '').length < 8) return null;

  return `whatsapp:${s}`;
}

function getTwilioClient(): {
  client: ReturnType<typeof Twilio>;
  fromNumber: string;
} | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromNumber =
    process.env.TWILIO_WHATSAPP_NUMBER?.trim() ||
    process.env.TWILIO_PHONE_NUMBER?.trim();

  if (!accountSid || !authToken || !fromNumber) {
    console.error(
      `${LOG} Faltan TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN o TWILIO_WHATSAPP_NUMBER (o TWILIO_PHONE_NUMBER)`
    );
    return null;
  }

  let from = fromNumber;
  if (!from.toLowerCase().startsWith('whatsapp:')) {
    const norm = normalizeWhatsAppAddress(from);
    if (!norm) {
      console.error(`${LOG} TWILIO_WHATSAPP_NUMBER no válido (se espera E.164, ej. +14155238886)`);
      return null;
    }
    from = norm;
  }

  return { client: Twilio(accountSid, authToken), fromNumber: from };
}

async function logNotification(params: {
  recipient: string;
  type: WhatsNotificationType;
  status: 'success' | 'failed';
  error_message: string | null;
  inscription_id?: string | null;
}): Promise<void> {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    console.warn(`${LOG} No se pudo registrar log: Supabase service role no configurado`);
    return;
  }

  const { error } = await supabase.from('notification_logs').insert({
    recipient: params.recipient,
    type: params.type,
    status: params.status,
    error_message: params.error_message,
    inscription_id: params.inscription_id ?? null,
  });

  if (error) {
    console.error(`${LOG} Error insertando notification_logs:`, error.message);
  }
}

async function sendWhatsAppMessage(
  toAddress: string,
  body: string,
  type: WhatsNotificationType,
  inscriptionId?: string | null
): Promise<SendResult> {
  const twilio = getTwilioClient();
  if (!twilio) {
    await logNotification({
      recipient: toAddress,
      type,
      status: 'failed',
      error_message: 'Twilio no configurado',
      inscription_id: inscriptionId ?? null,
    });
    return { success: false, error: 'Twilio no configurado' };
  }

  const safeBody = body.length > 4096 ? body.slice(0, 4096) : body;

  try {
    const result = await twilio.client.messages.create({
      body: safeBody,
      from: twilio.fromNumber,
      to: toAddress,
    });
    await logNotification({
      recipient: toAddress,
      type,
      status: 'success',
      error_message: null,
      inscription_id: inscriptionId ?? null,
    });
    return { success: true, sid: result.sid };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`${LOG} Envío fallido (${type}):`, errorMessage);
    await logNotification({
      recipient: toAddress,
      type,
      status: 'failed',
      error_message: errorMessage,
      inscription_id: inscriptionId ?? null,
    });
    return { success: false, error: errorMessage };
  }
}

/**
 * Invitación de pareja: plantilla fija con variables sustituidas (no Content API de Twilio).
 */
export async function sendPartnerInvitation(params: {
  toPhone: string;
  inviterName: string;
  tournamentName: string;
  invitationLink: string;
}): Promise<SendResult> {
  const { inviterName, tournamentName, invitationLink } = params;
  const toAddress = normalizeWhatsAppAddress(params.toPhone);
  if (!toAddress) {
    await logNotification({
      recipient: params.toPhone,
      type: 'partner_invitation',
      status: 'failed',
      error_message: 'Número de teléfono inválido',
    });
    return { success: false, error: 'Número de teléfono inválido' };
  }

  const body =
    `🎾 ¡Hola! ${inviterName} te ha invitado a ser su pareja en el torneo ${tournamentName}. ` +
    `Tienes un lugar RESERVADO. Confirma aquí: ${invitationLink}`;

  return sendWhatsAppMessage(toAddress, body, 'partner_invitation');
}

/**
 * Protocolo 1: alta manual por admin.
 * Envía bienvenida con acceso al Hub.
 */
export async function sendAdminWelcomeMessage(params: {
  phone: string;
  playerName: string;
  tournamentName: string;
  inscriptionId?: string;
}): Promise<SendResult> {
  const toAddress = normalizeWhatsAppAddress(params.phone);
  if (!toAddress) {
    await logNotification({
      recipient: params.phone,
      type: 'admin_welcome',
      status: 'failed',
      error_message: 'Número de teléfono inválido',
      inscription_id: params.inscriptionId ?? null,
    });
    return { success: false, error: 'Número de teléfono inválido' };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://smartpadel.app').replace(/\/+$/, '');
  const hubUrl = `${appUrl}/hub`;
  const body =
    `🎾 ¡Bienvenido/a ${params.playerName}!\n` +
    `Ya estás cargado/a para ${params.tournamentName} en ANTIGRAVITY Padel Score.\n` +
    `Ingresa aquí para ver tu actividad: ${hubUrl}`;

  return sendWhatsAppMessage(toAddress, body, 'admin_welcome', params.inscriptionId ?? null);
}

/**
 * Protocolo 2: invitación automática de pareja.
 * Incluye link directo de confirmación.
 */
export async function sendPartnerInvitationMessage(params: {
  phone: string;
  guestName: string;
  hostName: string;
  tournamentName: string;
  inscriptionId: string;
}): Promise<SendResult> {
  const toAddress = normalizeWhatsAppAddress(params.phone);
  if (!toAddress) {
    await logNotification({
      recipient: params.phone,
      type: 'partner_invitation',
      status: 'failed',
      error_message: 'Número de teléfono inválido',
      inscription_id: params.inscriptionId,
    });
    return { success: false, error: 'Número de teléfono inválido' };
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://smartpadel.app').replace(/\/+$/, '');
  const confirmUrl = `${appUrl}/confirmar-pareja?id=${encodeURIComponent(params.inscriptionId)}`;
  const body =
    `🎾 Hola ${params.guestName}, ${params.hostName} te invitó como pareja para ${params.tournamentName}.\n` +
    `Confirma tu lugar aquí: ${confirmUrl}`;

  return sendWhatsAppMessage(toAddress, body, 'partner_invitation', params.inscriptionId);
}

/**
 * Recordatorio de partido.
 */
export async function sendMatchReminder(params: {
  toPhone: string;
  playerName: string;
  time: string;
  courtName: string;
}): Promise<SendResult> {
  const { playerName, time, courtName } = params;
  const toAddress = normalizeWhatsAppAddress(params.toPhone);
  if (!toAddress) {
    await logNotification({
      recipient: params.toPhone,
      type: 'match_reminder',
      status: 'failed',
      error_message: 'Número de teléfono inválido',
    });
    return { success: false, error: 'Número de teléfono inválido' };
  }

  const body =
    `¡Hola ${playerName}! Recordatorio de Smart Padel: Tu partido es a las ${time} en la ${courtName}. ¡A ganar!`;

  return sendWhatsAppMessage(toAddress, body, 'match_reminder');
}

/**
 * Objeto de conveniencia (mismo módulo que las funciones exportadas).
 * Las rutas API deben seguir importando las funciones async directamente.
 */
export const whatsappService = {
  sendAdminWelcomeMessage,
  sendPartnerInvitationMessage,
  sendPartnerInvitation,
  sendMatchReminder,
};
