import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import {
  normalizeClubSlug,
  normalizeTvCourtNumber,
} from '@/lib/tvDeviceAuth';

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Servicio no disponible' }, { status: 503 });
    }

    const body = await req.json();
    const clubSlug = normalizeClubSlug(body.clubSlug);
    const courtNumber = normalizeTvCourtNumber(String(body.courtNumber ?? ''));
    const pinCode = String(body.pinCode ?? '').trim();

    if (!clubSlug || !courtNumber || !/^\d{4}$/.test(pinCode)) {
      return NextResponse.json({ error: 'Faltan parámetros o PIN inválido' }, { status: 400 });
    }

    const { data: device, error: fetchError } = await supabase
      .from('tv_devices')
      .select('*')
      .eq('club_slug', clubSlug)
      .eq('court_number', courtNumber)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!device || String(device.pin_code) !== pinCode) {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    const newToken = crypto.randomUUID();

    const { error: updateError } = await supabase
      .from('tv_devices')
      .update({
        is_authorized: true,
        device_token: newToken,
        pin_code: null,
        last_seen_at: new Date().toISOString(),
      })
      .eq('id', device.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ status: 'authorized', deviceToken: newToken });
  } catch (error) {
    console.error('[tv/verify]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
