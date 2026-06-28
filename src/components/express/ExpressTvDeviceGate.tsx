'use client';

import { useCallback, useEffect, useState } from 'react';
import { courtNumberFromExpressSlug } from '@/lib/tvDeviceAuth';

const TV_AUTH_ENABLED = process.env.NEXT_PUBLIC_EXPRESS_TV_AUTH === '1';

type TvAuthStatus = 'idle' | 'checking' | 'authorized' | 'pending_pin' | 'error';

function storageKey(clubSlug: string, courtNumber: string) {
  return `padel_tv_token_${clubSlug}_${courtNumber}`;
}

type Props = {
  clubSlug: string;
  expressSlug: string;
  children: React.ReactNode;
};

export function ExpressTvDeviceGate({ clubSlug, expressSlug, children }: Props) {
  const courtNumber = courtNumberFromExpressSlug(expressSlug);
  const [status, setStatus] = useState<TvAuthStatus>(TV_AUTH_ENABLED ? 'checking' : 'authorized');
  const [pinDraft, setPinDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const runInit = useCallback(async () => {
    if (!TV_AUTH_ENABLED || !clubSlug.trim()) {
      setStatus('authorized');
      return;
    }

    setStatus('checking');
    setError(null);

    const tokenKey = storageKey(clubSlug, courtNumber);
    const deviceToken =
      typeof window !== 'undefined' ? localStorage.getItem(tokenKey) || '' : '';

    try {
      const res = await fetch('/api/tv/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubSlug, courtNumber, deviceToken }),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 503) {
          setStatus('authorized');
          return;
        }
        throw new Error(json.error || 'No se pudo verificar la pantalla');
      }

      if (json.status === 'authorized') {
        if (json.deviceToken && typeof window !== 'undefined') {
          localStorage.setItem(tokenKey, String(json.deviceToken));
        }
        setStatus('authorized');
        return;
      }

      setStatus('pending_pin');
    } catch (e) {
      console.error('[ExpressTvDeviceGate]', e);
      setError(e instanceof Error ? e.message : 'Error de autenticación');
      setStatus('error');
    }
  }, [clubSlug, courtNumber]);

  useEffect(() => {
    void runInit();
  }, [runInit]);

  const submitPin = async () => {
    if (!/^\d{4}$/.test(pinDraft)) {
      setError('Introduce un PIN de 4 dígitos');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/tv/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clubSlug, courtNumber, pinCode: pinDraft }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'PIN incorrecto');
      }
      const tokenKey = storageKey(clubSlug, courtNumber);
      if (json.deviceToken && typeof window !== 'undefined') {
        localStorage.setItem(tokenKey, String(json.deviceToken));
      }
      setPinDraft('');
      setStatus('authorized');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PIN incorrecto');
    } finally {
      setSubmitting(false);
    }
  };

  if (!TV_AUTH_ENABLED || !clubSlug.trim()) {
    return <>{children}</>;
  }

  if (status === 'checking' || status === 'idle') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-white">
        <p className="text-sm font-bold uppercase tracking-widest text-padel-primary">
          Verificando pantalla…
        </p>
      </div>
    );
  }

  if (status === 'pending_pin' || status === 'error') {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[#050505] px-6 text-white">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-padel-primary">
            Activación de pantalla
          </p>
          <h1 className="mt-2 text-2xl font-black uppercase italic">{clubSlug}</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Cancha {courtNumber} · Introduce el PIN enviado por Telegram
          </p>
        </div>
        <input
          inputMode="numeric"
          maxLength={4}
          value={pinDraft}
          onChange={(e) => setPinDraft(e.target.value.replace(/\D/g, '').slice(0, 4))}
          className="w-40 rounded-2xl border-2 border-neutral-600 bg-black/50 px-4 py-4 text-center text-3xl font-black tracking-[0.4em] text-white focus:border-padel-primary focus:outline-none"
          placeholder="••••"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="button"
          disabled={submitting}
          onClick={() => void submitPin()}
          className="rounded-2xl bg-padel-primary px-8 py-3 text-sm font-black uppercase tracking-widest text-black disabled:opacity-50"
        >
          {submitting ? 'Verificando…' : 'Activar pantalla'}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export function isExpressTvAuthEnabled(): boolean {
  return TV_AUTH_ENABLED;
}
