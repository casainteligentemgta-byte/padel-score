import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/authServerSupabase';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

function esc(v: unknown): string {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function GET(req: Request) {
  const auth = await requireRole(req, ['admin']);
  if (auth instanceof NextResponse) return auth;

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  const { searchParams } = new URL(req.url);
  const uid = String(searchParams.get('uid') || '').trim();
  if (!uid) {
    return NextResponse.json({ error: 'Falta uid.' }, { status: 400 });
  }

  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, name, email, accepted_terms_version, legal_version, legal_timestamp, signature_url, biometric_photo_url, status_legal')
    .eq('id', uid)
    .maybeSingle();
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: 'Perfil no encontrado.' }, { status: 404 });

  const { data: participant } = await supabase
    .from('participants')
    .select('id, data, created_at, updated_at')
    .eq('owner_id', uid)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const pdata = (participant?.data || {}) as Record<string, unknown>;
  const displayName =
    String(profile.name || '').trim() ||
    String(pdata.fullName || `${pdata.name || ''} ${pdata.lastName || ''}`).trim() ||
    'Jugador';
  const legalVersion = String(profile.accepted_terms_version || profile.legal_version || 'v2.0-2026');
  const acceptedAt = profile.legal_timestamp ? new Date(profile.legal_timestamp).toLocaleString('es-VE') : '—';
  const signatureUrl = String(profile.signature_url || '');
  const biometricUrl = String(profile.biometric_photo_url || '');

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Contrato firmado - ${esc(displayName)}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
    h1 { margin: 0 0 8px; }
    .meta { margin: 0 0 16px; color: #444; font-size: 14px; }
    .box { border: 1px solid #ddd; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; background: #fafafa; }
    .k { color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 4px; }
    .v { font-weight: 700; }
    @media print { body { margin: 12px; } }
  </style>
</head>
<body>
  <h1>Contrato firmado del jugador</h1>
  <p class="meta">Documento generado por panel admin de Smart Padel</p>

  <div class="box">
    <div class="grid">
      <div><div class="k">Jugador</div><div class="v">${esc(displayName)}</div></div>
      <div><div class="k">UID</div><div class="v">${esc(uid)}</div></div>
      <div><div class="k">Email</div><div class="v">${esc(profile.email || '—')}</div></div>
      <div><div class="k">Versión legal</div><div class="v">${esc(legalVersion)}</div></div>
      <div><div class="k">Fecha de aceptación</div><div class="v">${esc(acceptedAt)}</div></div>
      <div><div class="k">Estado legal</div><div class="v">${esc(profile.status_legal || 'accepted')}</div></div>
      <div><div class="k">Cédula</div><div class="v">${esc(pdata.dni || '—')}</div></div>
      <div><div class="k">Teléfono</div><div class="v">${esc(pdata.phone || '—')}</div></div>
    </div>
  </div>

  <div class="box">
    <div class="k">Firma digital</div>
    ${signatureUrl ? `<img src="${esc(signatureUrl)}" alt="Firma digital" />` : '<p>Sin firma guardada.</p>'}
  </div>

  <div class="box">
    <div class="k">Validación facial</div>
    ${biometricUrl ? `<img src="${esc(biometricUrl)}" alt="Validación facial" />` : '<p>Sin validación facial guardada.</p>'}
  </div>
</body>
</html>`;

  return NextResponse.json({
    ok: true,
    html,
    name: displayName,
    legalVersion,
    acceptedAt,
    signatureUrl: signatureUrl || null,
    biometricUrl: biometricUrl || null,
  });
}

