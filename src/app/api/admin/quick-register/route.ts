import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

type QuickRegisterBody = {
  tournamentId?: string;
  categoryKey?: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

function sanitize(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function randomCode(len = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

async function buildUniquePartnerCode(supabase: ReturnType<typeof getSupabaseServiceClient>) {
  if (!supabase) return randomCode(6);
  for (let i = 0; i < 20; i++) {
    const candidate = randomCode(6);
    const { data } = await supabase.from('profiles').select('id').eq('unique_code', candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${randomCode(4)}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 503 },
      );
    }

    const body = (await request.json()) as QuickRegisterBody;
    const tournamentId = sanitize(body.tournamentId);
    const categoryKey = sanitize(body.categoryKey);
    const fullName = sanitize(body.fullName);
    const email = sanitize(body.email).toLowerCase();
    const phone = sanitize(body.phone);

    if (!tournamentId || !fullName || !email) {
      return NextResponse.json(
        { error: 'Campos obligatorios: tournamentId, fullName, email.' },
        { status: 400 },
      );
    }

    const { data: tournament, error: tErr } = await supabase
      .from('tournaments')
      .select('id, name')
      .eq('id', tournamentId)
      .maybeSingle();
    if (tErr || !tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado.' }, { status: 404 });
    }

    // 1) Buscar perfil por email
    let profileId = '';
    let profileExisted = false;

    const existing = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();
    if (existing.error) {
      return NextResponse.json({ error: existing.error.message }, { status: 400 });
    }

    if (existing.data?.id) {
      profileId = existing.data.id as string;
      profileExisted = true;
    } else {
      // 2) Crear perfil ghost (Shadow Profile)
      const partnerCode = await buildUniquePartnerCode(supabase);
      const insertRes = await supabase.from('profiles').insert({
        email,
        name: fullName,
        full_name: fullName,
        phone: phone || null,
        is_ghost: true,
        status: 'PENDING',
        unique_code: partnerCode,
      }).select('id').single();

      if (insertRes.error || !insertRes.data?.id) {
        // Si hubo carrera por email único, reintentar lectura.
        const retryExisting = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (retryExisting.data?.id) {
          profileId = retryExisting.data.id as string;
          profileExisted = true;
        } else {
          // Fallback por si algunas columnas no existen todavía en la tabla
          const fallback = await supabase.from('profiles').insert({
            email,
            name: fullName,
            phone: phone || null,
            unique_code: partnerCode,
          }).select('id').single();
          if (fallback.error || !fallback.data?.id) {
            return NextResponse.json(
              { error: fallback.error?.message || insertRes.error?.message || 'No se pudo crear perfil.' },
              { status: 400 },
            );
          }
          profileId = fallback.data.id as string;
        }
      } else {
        profileId = insertRes.data.id as string;
      }
    }

    // 3) Asignar al torneo: crear inscripción rápida si no existe
    let inscriptionCreated = false;
    const insExisting = await supabase
      .from('inscriptions')
      .select('id')
      .eq('tournament_id', tournamentId)
      .or(`participant_email.eq.${email},participant_id.eq.${profileId}`)
      .maybeSingle();
    if (insExisting.error) {
      return NextResponse.json({ error: insExisting.error.message }, { status: 400 });
    }

    if (!insExisting.data?.id) {
      const ins = await supabase.from('inscriptions').insert({
        owner_id: profileId,
        tournament_id: tournamentId,
        tournament_name: (tournament as any).name || 'Torneo',
        category_key: categoryKey || null,
        participant_name: fullName,
        participant_email: email,
        participant_id: profileId,
        payment_status: 'pending',
        is_placeholder: false,
        data: {
          quick_registered: true,
          is_ghost: !profileExisted,
          source: 'admin_quick_register',
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (ins.error) {
        return NextResponse.json({ error: ins.error.message }, { status: 400 });
      }
      inscriptionCreated = true;
    }

    return NextResponse.json({
      success: true,
      profileId,
      profileExisted,
      inscriptionCreated,
      message: 'Jugador añadido al sistema y al torneo',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error interno' }, { status: 500 });
  }
}

