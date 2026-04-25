/** Campos de ficha guardados en `participants.data` (JSONB). */
export type ParticipantDataSlice = { name?: string; lastName?: string; phone?: string };

export function extractParticipantDisplayFromData(
  data: Record<string, unknown> | null | undefined
): ParticipantDataSlice {
  if (!data) return {};
  return {
    name: typeof data.name === 'string' ? data.name : undefined,
    lastName:
      typeof data.lastName === 'string'
        ? data.lastName
        : typeof data.last_name === 'string'
          ? data.last_name
          : undefined,
    phone:
      typeof data.phone === 'string'
        ? data.phone
        : typeof data.telefono === 'string'
          ? data.telefono
          : typeof data.whatsapp === 'string'
            ? data.whatsapp
            : undefined,
  };
}
