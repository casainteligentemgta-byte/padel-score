import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';

export type ExpressTvTopLeft = {
  club: string;
  court: string;
};

/** Cabecera izquierda TV Express: club · cancha (marca en ExpressTvBrandMark). */
export function buildExpressTvTopLeft(
  baseVenue: string | null | undefined,
  courtNum: string,
): ExpressTvTopLeft {
  const raw = String(baseVenue ?? '').trim();
  const canonical = resolveCanonicalExpressVenue(raw) ?? raw;
  return {
    club: canonical.toUpperCase(),
    court: `Cancha ${courtNum}`,
  };
}
