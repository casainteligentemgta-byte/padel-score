import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { findExpressMatchByCourt, updateExpressMatchByCourt } from '@/lib/expressMatchDb';
import { normalizeExpressSlug, courtNumFromExpressSlug } from '@/lib/expressSlug';
import { isValidExpressSlug, normalizeExpressMatch, type ExpressMatch } from '@/types/expressMatch';
import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';

type Ctx = { params: Promise<{ slug: string }> };

/**
 * GET: obtiene o auto-provisiona la fila express_matches de una cancha (scan-go-N).
 * Query opcional: base_venue — alinea la sede de la TV sin write desde el cliente.
 * Usa service role para evitar fallos de RLS en TV/kiosco.
 */
export async function GET(req: Request, { params }: Ctx) {
  const { slug: slugParam } = await params;

  if (!isValidExpressSlug(slugParam)) {
    return NextResponse.json({ error: 'Slug inválido (use scan-go-1, scan-go-2, …)' }, { status: 400 });
  }

  const slug = normalizeExpressSlug(slugParam);
  const courtNum = courtNumFromExpressSlug(slug);
  const url = new URL(req.url);
  const rawVenue = (url.searchParams.get('base_venue') || '').trim();
  const baseVenue = rawVenue ? resolveCanonicalExpressVenue(rawVenue) ?? rawVenue : '';

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'No disponible (falta SUPABASE_SERVICE_ROLE_KEY).' },
      { status: 503 },
    );
  }

  const existing = courtNum ? await findExpressMatchByCourt(supabase, courtNum) : null;
  const patch: Partial<ExpressMatch> = {};

  if (existing) {
    if (String(existing.cancha_code ?? '') !== slug) {
      patch.cancha_code = slug;
    }
    if (baseVenue && String(existing.base_venue ?? '').trim() !== baseVenue) {
      patch.base_venue = baseVenue;
    }
    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ match: normalizeExpressMatch(existing) });
    }
    const updated = await updateExpressMatchByCourt(supabase, courtNum, patch);
    if (!updated.ok) {
      return NextResponse.json({ match: normalizeExpressMatch(existing) });
    }
    return NextResponse.json({ match: updated.match });
  }

  const result = await updateExpressMatchByCourt(
    supabase,
    courtNum,
    baseVenue ? { base_venue: baseVenue } : {},
  );

  if (!result.ok) {
    const msg = result.message || 'No se pudo crear la cancha express';
    const hint = msg.includes('does not exist')
      ? ' Ejecuta la migración 071_express_schema_repair.sql en Supabase.'
      : '';
    return NextResponse.json({ error: msg + hint }, { status: 500 });
  }

  return NextResponse.json({ match: result.match }, { status: 201 });
}
