'use client';

import { useEffect, useRef } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';

/**
 * Cada 30s actualiza `canchas.last_seen` en Supabase. Silencioso (sin await en UI).
 */
export function useCourtDisplayHeartbeat(canchaId: string) {
  const canchaIdRef = useRef(canchaId);
  canchaIdRef.current = canchaId;

  useEffect(() => {
    if (!canchaId) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const ping = () => {
      const id = canchaIdRef.current;
      if (!id) return;
      const iso = new Date().toISOString();
      void supabase.from('canchas').upsert(
        { cancha_id: id, last_seen: iso, updated_at: iso },
        { onConflict: 'cancha_id' },
      );
    };

    ping();
    const t = window.setInterval(ping, 30_000);
    return () => window.clearInterval(t);
  }, [canchaId]);
}
