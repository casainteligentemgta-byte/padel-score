'use client';

import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_WINDOW_MS = 550;

/**
 * Tres toques/clics seguidos en la misma zona disparan el callback (gesto oculto en kiosko / TV táctil).
 */
export function useTripleTap(onTriggered: () => void, enabled: boolean, windowMs = DEFAULT_WINDOW_MS) {
  const countRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(onTriggered);
  cbRef.current = onTriggered;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      countRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [enabled]);

  return useCallback(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    countRef.current += 1;
    if (countRef.current >= 3) {
      countRef.current = 0;
      timerRef.current = null;
      cbRef.current();
      return;
    }
    timerRef.current = setTimeout(() => {
      countRef.current = 0;
      timerRef.current = null;
    }, windowMs);
  }, [enabled, windowMs]);
}
