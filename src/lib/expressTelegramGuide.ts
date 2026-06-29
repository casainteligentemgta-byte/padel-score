import { buildExpressShortDisplayUrl, expressVenuePathSlug } from '@/lib/expressShortUrl';
import {
  EXPRESS_VENUE_COURT_COUNTS,
  EXPRESS_VENUE_OPTIONS,
  expressCourtCountForClub,
  resolveCanonicalExpressVenue,
} from '@/lib/expressVenueCourts';

const TELEGRAM_MSG_SAFE_LIMIT = 3800;

function expressTvUrl(baseVenue: string, courtNumber: number): string {
  return buildExpressShortDisplayUrl(baseVenue, courtNumber);
}

function guideBlockForVenue(venue: string): string {
  const count = EXPRESS_VENUE_COURT_COUNTS[venue] ?? expressCourtCountForClub(venue);
  const pathCode = expressVenuePathSlug(venue);
  const lines = Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    return `C${n}: \`${expressTvUrl(venue, n)}\``;
  });
  return `\n*${venue}* · código \`${pathCode}\` · ${count} cancha${count !== 1 ? 's' : ''}\n${lines.join('\n')}`;
}

function resolveGuideVenues(filter?: string): string[] {
  const trimmed = String(filter ?? '').trim();
  if (!trimmed) {
    return [...EXPRESS_VENUE_OPTIONS].sort((a, b) => a.localeCompare(b, 'es'));
  }

  const canonical = resolveCanonicalExpressVenue(trimmed);
  if (canonical) return [canonical];

  const upper = trimmed.toUpperCase();
  const byPathCode = EXPRESS_VENUE_OPTIONS.filter((v) => expressVenuePathSlug(v) === upper);
  if (byPathCode.length) return byPathCode;

  const lower = trimmed.toLowerCase();
  const partial = EXPRESS_VENUE_OPTIONS.filter((v) => v.toLowerCase().includes(lower));
  return partial.length ? partial.sort((a, b) => a.localeCompare(b, 'es')) : [];
}

/** Mensajes Telegram con URLs de cada pizarra Express (puede partirse en varios). */
export function buildExpressTelegramUrlGuide(filterVenue?: string): string[] {
  const venues = resolveGuideVenues(filterVenue);
  if (!venues.length) {
    return [
      '❌ Sede no reconocida.\n\nUsa `/urls` para todas las sedes o `/urls BD` / `/urls El Bodeguero` para una sola.',
    ];
  }

  const header =
    venues.length === 1
      ? `📺 *URLs Express · ${venues[0]}* · \`${expressVenuePathSlug(venues[0])}\``
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

/** Mensaje de bienvenida staff tras /login (incluye URLs con abreviatura). */
export function buildExpressStaffWelcomeMessage(params: {
  staffName: string;
  roleLabel?: string | null;
  clubSlug: string;
  courtNumbers: string[];
}): string {
  const venue = resolveCanonicalExpressVenue(params.clubSlug) ?? params.clubSlug.trim();
  const pathCode = expressVenuePathSlug(venue);
  const roleLine = params.roleLabel ? ` · _${params.roleLabel}_` : '';
  const urlLines = params.courtNumbers
    .map((courtNumber) => `C${courtNumber}: \`${expressTvUrl(venue, Number(courtNumber))}\``)
    .join('\n');

  return (
    `✅ *Bienvenido ${params.staffName}*${roleLine}\n` +
    `🏢 ${venue} · código \`${pathCode}\`\n\n` +
    `📺 *Cargar en la TV:*\n${urlLines}\n\n` +
    `Por cancha:\n` +
    `• *QR* — muestra el código en la TV (1 min)\n` +
    `• *Reset* — limpia marcador y vuelve a espera\n\n` +
    `_Comandos: /urls · /menu · /help_`
  );
}

export function buildExpressTelegramGuideHelp(): string {
  return (
    '📋 *Comandos guía*\n\n' +
    '*Admin*\n' +
    '`/urls` — URLs de todas las pizarras\n' +
    '`/urls BD` — solo un club (código o nombre)\n' +
    '`/guia` — alias de `/urls`\n' +
    '`/informe` — activaciones de hoy\n\n' +
    '*Staff de club* (tras `/login CODIGO`)\n' +
    '`/urls` — URLs de tu sede\n' +
    '`/menu` — botones QR y Reset\n' +
    '`/help` — esta ayuda\n\n' +
    'Vinculación: el admin te da un código → `/login BD-A7K3`'
  );
}
