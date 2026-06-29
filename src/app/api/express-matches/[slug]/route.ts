import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { findExpressMatchByCourt, updateExpressMatchByCourt } from '@/lib/expressMatchDb';
import { normalizeExpressSlug, courtNumFromExpressSlug } from '@/lib/expressSlug';
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
  const courtNum = courtNumFromExpressSlug(slug);

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 503 },
    );
  }

  const existing = courtNum ? await findExpressMatchByCourt(supabase, courtNum) : null;

  if (existing) {
    return NextResponse.json({ match: normalizeExpressMatch(existing) });
  }

  const result = await updateExpressMatchByCourt(supabase, courtNum, {});

  if (!result.ok) {
    const msg = result.message || 'No se pudo crear la cancha express';
    const hint = msg.includes('does not exist')
      ? ' Ejecuta la migración 071_express_schema_repair.sql en Supabase.'
      : '';
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }

  return NextResponse.json({ match: result.match }, { status: 201 });
}
