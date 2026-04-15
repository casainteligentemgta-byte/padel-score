import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import {
  PuntitoLegalUpdateEmail,
  PUNTITO_LEGAL_UPDATE_EMAIL_SUBJECT,
} from '@/emails/PuntitoLegalUpdateEmail';
import { CURRENT_TERMS_VERSION } from '@/lib/legal/termsVersion';

/**
 * Envío del email de Puntito (actualización legal).
 * Protege con `LEGAL_BULK_EMAIL_SECRET` en cabecera `Authorization: Bearer <secret>`
 * para uso desde Edge Functions / cron (no exponer en cliente).
 */
export async function POST(req: Request) {
  const secret = process.env.LEGAL_BULK_EMAIL_SECRET?.trim();
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!secret || auth !== secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Smart Padel <onboarding@resend.dev>';
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY no configurada' }, { status: 500 });
  }

  let body: { to?: string; playerName?: string; profileSignUrl?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const to = typeof body.to === 'string' ? body.to.trim() : '';
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Email destino inválido' }, { status: 400 });
  }

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (typeof process.env.VERCEL_URL === 'string' && process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://smartpadel.app');
  const profileSignUrl =
    typeof body.profileSignUrl === 'string' && body.profileSignUrl.startsWith('http')
      ? body.profileSignUrl
      : `${base}/mi-cuenta`;

  const playerName = typeof body.playerName === 'string' ? body.playerName.trim() : 'Jugador';

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: PUNTITO_LEGAL_UPDATE_EMAIL_SUBJECT,
    react: PuntitoLegalUpdateEmail({
      playerName,
      profileSignUrl,
      termsVersionLabel: CURRENT_TERMS_VERSION,
    }),
  });

  if (error) {
    console.error('[puntito-update-email]', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
