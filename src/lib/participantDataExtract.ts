/** Campos de ficha guardados en `participants.data` (JSONB). */
export type ParticipantDataSlice = { name?: string; lastName?: string; phone?: string };

/** Mínimo de dígitos para considerar que hay teléfono real (evita solo "+58" o basura). */
const MIN_PHONE_DIGITS = 6;

export function normalizeParticipantJson(raw: unknown): Record<string, unknown> {
  if (raw == null) return {};
  if (typeof raw === 'string') {
    try {
      const p = JSON.parse(raw) as unknown;
      return p && typeof p === 'object' && !Array.isArray(p) ? (p as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return {};
}

function coerceText(v: unknown): string | undefined {
  if (v == null) return undefined;
  if (typeof v === 'string') {
    const t = v.trim();
    return t || undefined;
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    const t = String(Math.trunc(v));
    return t || undefined;
  }
  return undefined;
}

/** Primer teléfono “usable” en el JSON (varias claves y tipos). */
function pickPhoneFromRecord(data: Record<string, unknown>): string | undefined {
  const keys = ['phone', 'telefono', 'whatsapp', 'mobile', 'celular', 'phoneNumber', 'tel'];
  for (const k of keys) {
    const s = coerceText(data[k]);
    if (s && s.replace(/\D/g, '').length >= MIN_PHONE_DIGITS) return s;
  }
  const contact = data.contact;
  if (contact && typeof contact === 'object' && !Array.isArray(contact)) {
    const c = contact as Record<string, unknown>;
    for (const k of ['phone', 'telefono', 'mobile', 'celular']) {
      const s = coerceText(c[k]);
      if (s && s.replace(/\D/g, '').length >= MIN_PHONE_DIGITS) return s;
    }
  }
  return undefined;
}

export function extractParticipantDisplayFromData(
  data: Record<string, unknown> | null | undefined
): ParticipantDataSlice {
  if (!data) return {};
  return {
    name: coerceText(data.name),
    lastName: coerceText(data.lastName) ?? coerceText(data.last_name),
    phone: pickPhoneFromRecord(data),
  };
}

/**
 * Si un usuario tiene varias fichas `participants`, prioriza la más reciente con teléfono válido;
 * si ninguna tiene teléfono, usa la ficha más reciente (nombre/apellido).
 */
export function mergeParticipantRowsForDisplay(
  rows: Array<{ data: unknown; created_at?: string | null }>
): ParticipantDataSlice {
  if (!rows.length) return {};
  const sorted = [...rows].sort((a, b) =>
    String(b.created_at || '').localeCompare(String(a.created_at || ''))
  );
  for (const row of sorted) {
    const ex = extractParticipantDisplayFromData(normalizeParticipantJson(row.data));
    const digits = (ex.phone || '').replace(/\D/g, '').length;
    if (digits >= MIN_PHONE_DIGITS) return ex;
  }
  return extractParticipantDisplayFromData(normalizeParticipantJson(sorted[0].data));
}
