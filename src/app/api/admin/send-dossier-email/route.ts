import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { requireRole } from '@/lib/authServerSupabase';
import { DossierShareEmail, DOSSIER_SHARE_EMAIL_SUBJECT } from '@/emails/DossierShareEmail';
import { driveDossierUrls } from '@/lib/driveDossier';

function getBearer(req: Request): string | null {
  const a = req.headers.get('authorization');
  if (!a?.startsWith('Bearer ')) return null;
  return a.slice(7).trim() || null;
}

/**
 * Admin: envía el enlace del dossier comercial (Google Drive) por correo vía Resend.
 * Autenticación: Authorization Bearer (JWT de sesión Supabase) + rol admin.
 */
export async function POST(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const token = getBearer(req);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!token || !url || !anon) {
    return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 });
  }

  let body: { to?: string; recipientName?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : '';
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: 'Email destino inválido' }, { status: 400 });
  }

  const sb = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: row, error: selErr } = await sb.from('admin_settings').select('publicidad_dossier_drive_id').eq('id', 1).maybeSingle();
  if (selErr) {
    return NextResponse.json({ error: selErr.message }, { status: 400 });
  }
  const folderId = String((row as { publicidad_dossier_drive_id?: string } | null)?.publicidad_dossier_drive_id || '').trim();
  if (!folderId) {
    return NextResponse.json({ error: 'No hay dossier configurado en Admin → Publicidad' }, { status: 400 });
  }

  const dossierUrl = driveDossierUrls(folderId).open;
  const recipientName = typeof body.recipientName === 'string' ? body.recipientName.trim() : 'Hola';

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Smart Padel <onboarding@resend.dev>';
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY no configurada' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: DOSSIER_SHARE_EMAIL_SUBJECT,
    react: DossierShareEmail({ recipientName, dossierUrl }),
  });

  if (error) {
    console.error('[send-dossier-email]', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
