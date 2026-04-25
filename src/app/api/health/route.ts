import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Salud básica del backend (Supabase vía service role).
 * Público: no expone claves; solo estado agregado para monitoreo en admin.
 */
export async function GET() {
  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      {
        ok: true,
        supabase: 'unconfigured' as const,
        detail: 'Falta SUPABASE_SERVICE_ROLE_KEY en el servidor.',
      },
      { status: 200 }
    );
  }

  const { error } = await supabase.from('tournaments').select('id').limit(1);
  if (error) {
    return NextResponse.json(
      {
        ok: false,
        supabase: 'error' as const,
        detail: error.message,
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, supabase: 'ok' as const });
}
