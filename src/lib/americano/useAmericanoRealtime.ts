'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { fetchAmericanoBundle, type AmericanoBundle } from '@/lib/americano/americanoDb';

export type AmericanoRealtimeState = {
  loading: boolean;
  error: string | null;
  bundle: AmericanoBundle | null;
  refresh: () => Promise<void>;
};

export function useAmericanoRealtime(sessionId: string): AmericanoRealtimeState {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bundle, setBundle] = useState<AmericanoBundle | null>(null);

  const refresh = useCallback(async () => {
    if (!supabase || !sessionId) {
      setError('Supabase no configurado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await fetchAmericanoBundle(supabase, sessionId);
    if (!data) {
      setError('Sesión no encontrada.');
      setBundle(null);
    } else {
      setError(null);
      setBundle(data);
    }
    setLoading(false);
  }, [sessionId, supabase]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!supabase || !sessionId) return;

    const channel = supabase
      .channel(`americano-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'americano_players', filter: `session_id=eq.${sessionId}` },
        () => {
          void refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'americano_matches', filter: `session_id=eq.${sessionId}` },
        () => {
          void refresh();
        },
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'americano_sessions', filter: `id=eq.${sessionId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [sessionId, supabase, refresh]);

  return { loading, error, bundle, refresh };
}
