import { getAppBaseUrl } from '@/lib/brand';
import type { ClubStaffRow } from '@/lib/expressClubStaff';
import { buildExpressShortDisplayPath, expressVenuePathSlug } from '@/lib/expressShortUrl';
import {
  EXPRESS_VENUE_COURT_COUNTS,
  EXPRESS_VENUE_OPTIONS,
  expressCourtCountForClub,
} from '@/lib/expressVenueCourts';

export const CLUB_STAFF_ROLE_PRESETS = [
  'Encargado pizarras',
  'Recepción',
  'Canchas',
  'Turno mañana',
  'Turno tarde',
] as const;

export type ClubStaffRosterVenue = {
  venue: string;
  pathCode: string;
  courtCount: number;
  staff: ClubStaffRow[];
  linkedCount: number;
  activeCount: number;
};

export function groupClubStaffByVenue(staff: ClubStaffRow[]): ClubStaffRosterVenue[] {
  const byVenue = new Map<string, ClubStaffRow[]>();
  for (const row of staff) {
    const key = row.club_slug;
    const list = byVenue.get(key) ?? [];
    list.push(row);
    byVenue.set(key, list);
  }

  return EXPRESS_VENUE_OPTIONS.map((venue) => {
    const rows = (byVenue.get(venue) ?? []).sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return {
      venue,
      pathCode: expressVenuePathSlug(venue),
      courtCount: EXPRESS_VENUE_COURT_COUNTS[venue] ?? expressCourtCountForClub(venue),
      staff: rows,
      linkedCount: rows.filter((r) => r.is_active && r.telegram_chat_id != null).length,
      activeCount: rows.filter((r) => r.is_active).length,
    };
  });
}

export function rosterSummary(staff: ClubStaffRow[]): {
  total: number;
  active: number;
  linked: number;
  clubsWithStaff: number;
} {
  const activeRows = staff.filter((r) => r.is_active);
  const clubs = new Set(activeRows.map((r) => r.club_slug));
  return {
    total: staff.length,
    active: activeRows.length,
    linked: activeRows.filter((r) => r.telegram_chat_id != null).length,
    clubsWithStaff: clubs.size,
  };
}

/** Texto listo para WhatsApp con URLs TV y códigos /login del club. */
export function buildClubStaffShareMessage(venue: ClubStaffRosterVenue): string {
  const base = getAppBaseUrl().replace(/\/$/, '');
  const urlLines = Array.from({ length: venue.courtCount }, (_, i) => {
    const n = i + 1;
    return `C${n}: ${base}${buildExpressShortDisplayPath(venue.venue, n)}`;
  }).join('\n');

  const staffLines =
    venue.staff.length === 0
      ? '_Sin manejadores registrados aún._'
      : venue.staff
          .filter((r) => r.is_active)
          .map((r) => {
            const role = r.role_label ? ` (${r.role_label})` : '';
            const status = r.telegram_chat_id ? '✅' : '⏳';
            return `${status} ${r.name}${role}: /login ${r.auth_code}`;
          })
          .join('\n');

  return (
    `📺 *Smart Padel · ${venue.venue}*\n` +
    `Código sede: *${venue.pathCode}*\n\n` +
    `*URLs para las TVs:*\n${urlLines}\n\n` +
    `*Manejadores Telegram:*\n${staffLines}\n\n` +
    `En el bot: /login TU-CODIGO → botones QR y Reset por cancha.`
  );
}

export function displayStaffName(row: ClubStaffRow): string {
  return row.role_label ? `${row.name} · ${row.role_label}` : row.name;
}
