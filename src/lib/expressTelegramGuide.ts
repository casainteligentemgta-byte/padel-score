import { getAppBaseUrl } from '@/lib/brand';
import { buildExpressDisplayUrl } from '@/lib/expressPublicidad';
import {
  EXPRESS_VENUE_COURT_COUNTS,
  EXPRESS_VENUE_OPTIONS,
  expressCourtCountForClub,
  resolveCanonicalExpressVenue,
} from '@/lib/expressVenueCourts';

const TELEGRAM_MSG_SAFE_LIMIT = 3800;

function expressTvUrl(baseVenue: string, courtNumber: number): string {
  return `${getAppBaseUrl()}${buildExpressDisplayUrl(courtNumber, baseVenue)}`;
}

function guideBlockForVenue(venue: string): string {
  const count = EXPRESS_VENUE_COURT_COUNTS[venue] ?? expressCourtCountForClub(venue);
  const lines = Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return `C${n}: \`${expressTvUrl(venue, n)}\``;
  });
  return `\n*${venue}* · ${count} cancha${count !== 1 ? 's' : ''}\n${lines.join('\n')}`;
}

function resolveGuideVenues(filter?: string): string[] {
  const trimmed = String(filter ?? '').trim();
  if (!trimmed) {
    return [...EXPRESS_VENUE_OPTIONS].sort((a, b) => a.localeCompare(b, 'es'));
  }

  const canonical = resolveCanonicalExpressVenue(trimmed);
  if (canonical) return [canonical];

  const lower = trimmed.toLowerCase();
  const partial = EXPRESS_VENUE_OPTIONS.filter((v) => v.toLowerCase().includes(lower));
  return partial.length ? partial.sort((a, b) => a.localeCompare(b, 'es')) : [];
}

/** Mensajes Telegram con URLs de cada pizarra Express (puede partirse en varios). */
export function buildExpressTelegramUrlGuide(filterVenue?: string): string[] {
  const venues = resolveGuideVenues(filterVenue);
  if (!venues.length) {
    return [
      '❌ Sede no reconocida.\n\nUsa `/urls` para todas las sedes o `/urls El Bodeguero` para una sola.',
    ];
  }

  const header =
    venues.length === 1
      ? `📺 *URLs Express · ${venues[0]}*`
      : '📺 *Guía URLs Express TV*\n_Todas las sedes · abre en el navegador de cada TV_';

  const chunks: string[] = [];
  let current = header;

  for (const venue of venues) {
    const block = guideBlockForVenue(venue);
    if (current.length + block.length > TELEGRAM_MSG_SAFE_LIMIT) {
      chunks.push(current);
      current = block.trimStart();
    } else {
      current += block;
    }
  }

  if (current.trim()) chunks.push(current);
  return chunks.length ? chunks : [header];
}

export function buildExpressTelegramGuideHelp(): string {
  return (
    '📋 *Comandos guía (solo admin)*\n\n' +
    '`/urls` — URLs de todas las pizarras\n' +
    '`/urls El Bodeguero` — solo un club\n' +
    '`/guia` — alias de `/urls`\n' +
    '`/informe` — informe de activaciones de hoy (prueba)\n\n' +
    'El staff de clubes usa `/login CODIGO` para QR y Reset.'
  );
}
