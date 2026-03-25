export type CourtHealthStatus = 'online' | 'warning' | 'offline' | 'unknown';

/** Verde <60s, naranja 60s–5min, rojo >5min o sin dato */
export function healthStatusFromLastSeen(iso: string | null | undefined): CourtHealthStatus {
  if (!iso) return 'offline';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'unknown';
  const ageSec = (Date.now() - t) / 1000;
  if (ageSec < 60) return 'online';
  if (ageSec < 300) return 'warning';
  return 'offline';
}

export function healthBadgeLabel(status: CourtHealthStatus): string {
  switch (status) {
    case 'online':
      return 'En línea';
    case 'warning':
      return 'Alerta';
    case 'offline':
      return 'Desconectada';
    default:
      return '—';
  }
}
