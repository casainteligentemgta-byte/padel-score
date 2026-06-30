import { EXPRESS_TV_BRAND } from '@/lib/expressSlug';
import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';

export type ExpressTvTopLeft = {
  brand: string;
  club: string;
  court: string;
};

/** Cabecera izquierda TV Express: marca · club · cancha. */
export function buildExpressTvTopLeft(
  baseVenue: string | null | undefined,
  courtNum: string,
): ExpressTvTopLeft {
  const raw = String(baseVenue ?? '').trim();
  const canonical = resolveCanonicalExpressVenue(raw) ?? raw;
  return {
    brand: EXPRESS_TV_BRAND.toUpperCase(),
    club: canonical.toUpperCase(),
    court: `Cancha ${courtNum}`,
  };
}
