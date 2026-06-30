import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';
import { courtNumFromExpressSlug } from '@/lib/expressSlug';

export type ExpressTvTopLeft = {
  club: string;
  court: string;
};

/** Etiqueta de cancha en cabecera Express (Cancha 1, Cancha 2, …). */
export function expressPistaLabel(courtNumOrCode: string): string {
  const num = courtNumFromExpressSlug(String(courtNumOrCode ?? '').trim());
  return num ? `Cancha ${num}` : 'Cancha';
}

/** Cabecera izquierda TV Express: club · pista (marca en ExpressTvBrandMark). */
export function buildExpressTvTopLeft(
  baseVenue: string | null | undefined,
  courtNum: string,
): ExpressTvTopLeft {
  const raw = String(baseVenue ?? '').trim();
  const canonical = resolveCanonicalExpressVenue(raw) ?? raw;
  return {
    club: canonical.toUpperCase(),
    court: expressPistaLabel(courtNum),
  };
}
