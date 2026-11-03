import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@/lib/supabase/server';
import { findExpressMatchByCourt } from '@/lib/expressMatchDb';
import { normalizeExpressSlug, courtNumFromExpressSlug } from '@/lib/expressSlug';
import { isValidExpressSlug, normalizeExpressMatch } from '@/types/expressMatch';

type Ctx = { params: Promise<{ slug: string }> };

/**
 * GET: snapshot de la cancha Express (scan-go-N). Solo lectura.
 * La fila la crea el staff (Telegram /reset). No auto-provisiona ni escribe venue.
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
  if (!existing) {
    return NextResponse.json(
      {
        error: 'Cancha no inicializada. El encargado debe activarla desde Telegram.',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({ match: normalizeExpressMatch(existing) });
}
