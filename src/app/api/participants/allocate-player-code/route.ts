import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { getAuthUserWithRole } from '@/lib/authServerSupabase';

const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CODE_RE = /^[A-Z0-9]{6}$/;

function randomSixCharCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
  }
  return code;
}

async function isCodeTakenGlobal(supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>, code: string): Promise<boolean> {
  const c = code.toUpperCase();
  const { data: p } = await supabase.from('profiles').select('id').eq('unique_code', c).maybeSingle();
  if (p) return true;
  const { data: rows } = await supabase.from('participants').select('id').eq('data->>uniqueCode', c).limit(1);
  return (rows?.length ?? 0) > 0;
}

async function allocateGlobalUnique(
  supabase: NonNullable<ReturnType<typeof getSupabaseServiceClient>>
): Promise<string> {
  for (let i = 0; i < 64; i++) {
    const code = randomSixCharCode();
    if (!(await isCodeTakenGlobal(supabase, code))) return code;
  }
  throw new Error('No se pudo generar un código único');
}

/**
 * Asigna código de 6 caracteres para una ficha de jugador:
 * - Único entre profiles.unique_code y participants.data.uniqueCode
 * - Mismo email (misma cuenta / owner) → código del jugador creado primero (created_at)
 * - Email igual al del perfil de la cuenta → reutiliza unique_code del perfil
 * - Email ya usado por otro owner → 409
 */
export async function POST(req: Request) {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 501 }
    );
  }

  const user = await getAuthUserWithRole(req);
  if (!user) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  let body: { ownerUid?: string; email?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const ownerUid = String(body?.ownerUid || '').trim();
  if (!ownerUid) {
    return NextResponse.json({ error: 'Falta ownerUid.' }, { status: 400 });
  }

  const role = user.role?.toLowerCase?.() ?? 'player';
  if (user.uid !== ownerUid && role !== 'admin') {
    return NextResponse.json({ error: 'No puedes asignar códigos para otra cuenta.' }, { status: 403 });
  }

  const normalizedEmail =
    typeof body.email === 'string' && body.email.trim()
      ? body.email.trim().toLowerCase()
      : '';

  if (normalizedEmail) {
    const { data: byEmail, error: e1 } = await supabase
      .from('participants')
      .select('id, owner_id, created_at, data')
      .eq('data->>email', normalizedEmail);

    if (e1) {
      return NextResponse.json({ error: e1.message }, { status: 500 });
    }

    const rows = byEmail || [];
    const otherOwner = rows.find((r) => r.owner_id !== ownerUid);
    if (otherOwner) {
      return NextResponse.json(
        { error: 'Este email ya está registrado con otro usuario de la plataforma.' },
        { status: 409 }
      );
    }

    const sameOwner = rows
      .filter((r) => r.owner_id === ownerUid)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (sameOwner.length > 0) {
      const leader = sameOwner[0];
      const raw = leader.data?.uniqueCode;
      if (typeof raw === 'string' && CODE_RE.test(raw.trim().toUpperCase())) {
        return NextResponse.json({ uniqueCode: raw.trim().toUpperCase() });
      }
      try {
        const newCode = await allocateGlobalUnique(supabase);
        const newData = { ...(leader.data || {}), uniqueCode: newCode };
        const { error: upErr } = await supabase
          .from('participants')
          .update({ data: newData, updated_at: new Date().toISOString() })
          .eq('id', leader.id);
        if (upErr) {
          return NextResponse.json({ error: upErr.message }, { status: 500 });
        }
        return NextResponse.json({ uniqueCode: newCode });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al generar código';
        return NextResponse.json({ error: msg }, { status: 500 });
      }
    }
  }

  const { data: prof, error: pe } = await supabase
    .from('profiles')
    .select('email, unique_code')
    .eq('id', ownerUid)
    .maybeSingle();

  if (pe) {
    return NextResponse.json({ error: pe.message }, { status: 500 });
  }

  const profileEmail = (prof?.email || '').trim().toLowerCase();
  if (
    normalizedEmail &&
    profileEmail &&
    profileEmail === normalizedEmail &&
    prof?.unique_code &&
    CODE_RE.test(String(prof.unique_code).trim().toUpperCase())
  ) {
    return NextResponse.json({ uniqueCode: String(prof.unique_code).trim().toUpperCase() });
  }

  try {
    const fresh = await allocateGlobalUnique(supabase);
    return NextResponse.json({ uniqueCode: fresh });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al generar código';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
