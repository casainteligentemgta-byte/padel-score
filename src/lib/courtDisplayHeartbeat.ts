'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Cada 30s actualiza `canchas.last_seen` en Supabase. Silencioso (sin await en UI).
 * `venueName` alinea la fila con Dynamic Studio / publicidad (misma PK que migración 040).
 */
export function useCourtDisplayHeartbeat(canchaId: string, venueName?: string | null) {
  const canchaIdRef = useRef(canchaId);
  const venueRef = useRef((venueName ?? '').trim());
  canchaIdRef.current = canchaId;
  venueRef.current = (venueName ?? '').trim();

  useEffect(() => {
    if (!canchaId) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const ping = () => {
      const id = canchaIdRef.current;
      if (!id) return;
      const iso = new Date().toISOString();
      const v = venueRef.current;
      void supabase.from('canchas').upsert(
        { venue_name: v, cancha_id: id, last_seen: iso, updated_at: iso },
        { onConflict: 'venue_name,cancha_id' },
      );
    };

    ping();
    const t = window.setInterval(ping, 30_000);
    return () => window.clearInterval(t);
  }, [canchaId, venueName]);
}
