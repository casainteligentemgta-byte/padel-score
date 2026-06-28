import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { notifyTelegramTvPinRequest } from '@/lib/telegramBot';
import {
  generateTvPinCode,
  normalizeClubSlug,
  normalizeDeviceToken,
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
    const deviceToken = normalizeDeviceToken(body.deviceToken);

    if (!clubSlug || !courtNumber) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const { data: existingDevice, error: fetchError } = await supabase
      .from('tv_devices')
      .select('*')
      .eq('club_slug', clubSlug)
      .eq('court_number', courtNumber)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (
      existingDevice?.is_authorized &&
      deviceToken &&
      existingDevice.device_token === deviceToken
    ) {
      await supabase
        .from('tv_devices')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingDevice.id);
      return NextResponse.json({ status: 'authorized' });
    }

    if (existingDevice?.is_authorized && !deviceToken && existingDevice.device_token) {
      await supabase
        .from('tv_devices')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', existingDevice.id);
      return NextResponse.json({
        status: 'authorized',
        deviceToken: existingDevice.device_token,
      });
    }

    if (
      existingDevice?.is_authorized &&
      deviceToken &&
      existingDevice.device_token &&
      existingDevice.device_token !== deviceToken
    ) {
      return NextResponse.json({ status: 'pending_pin' });
    }

    let pin = existingDevice?.pin_code ? String(existingDevice.pin_code) : null;
    let notifyTelegram = false;

    if (!pin) {
      pin = generateTvPinCode();
      notifyTelegram = true;
    }

    const upsertPayload: Record<string, unknown> = {
      club_slug: clubSlug,
      court_number: courtNumber,
      pin_code: pin,
      is_authorized: false,
    };
    if (deviceToken) {
      upsertPayload.device_token = deviceToken;
    }

    const { error: upsertError } = await supabase
      .from('tv_devices')
      .upsert(upsertPayload, { onConflict: 'club_slug,court_number' });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    if (notifyTelegram) {
      await notifyTelegramTvPinRequest({ clubSlug, courtNumber, pin });
    }

    return NextResponse.json({ status: 'pending_pin' });
  } catch (error) {
    console.error('[tv/init]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
