import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { normalizeExpressSlug } from '@/lib/expressSlug';
import { isValidExpressSlug, normalizeExpressMatch } from '@/types/expressMatch';

type Ctx = { params: Promise<{ slug: string }> };

/**
 * GET: obtiene o auto-provisiona la fila express_matches de una cancha (scan-go-N).
 * Usa service role para evitar fallos de RLS en TV/kiosco.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const { slug: slugParam } = await params;

  if (!isValidExpressSlug(slugParam)) {
    return NextResponse.json({ error: 'Slug inválido (use scan-go-1, scan-go-2, …)' }, { status: 400 });
  }

  const slug = normalizeExpressSlug(slugParam);

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 503 },
    );
  }

  const { data: existing, error: fetchError } = await supabase
    .from('express_matches')
    .select('*')
    .eq('cancha_code', slug)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ match: normalizeExpressMatch(existing) });
  }

  const { data: created, error: insertError } = await supabase
    .from('express_matches')
    .insert([{ cancha_code: slug }])
    .select('*')
    .single();

  if (insertError || !created) {
    const msg = insertError?.message || 'No se pudo crear la cancha express';
    const hint = msg.includes('does not exist')
      ? ' Ejecuta la migración 056_express_matches.sql en Supabase.'
      : '';
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }

  return NextResponse.json({ match: normalizeExpressMatch(created) }, { status: 201 });
}
