'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { notFound } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  ExpressMatch,
  getExpressAppBaseUrl,
  isValidExpressSlug,
  normalizeExpressMatch,
} from '@/types/expressMatch';
import { BouncingBall } from '@/components/BouncingBall';

type LoadState = 'loading' | 'ready' | 'error';

export default function ExpressTvDisplay({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [match, setMatch] = useState<ExpressMatch | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isValidExpressSlug(slug)) {
    notFound();
  }

  useEffect(() => {
    if (!supabase) {
      setErrorMessage('Supabase no configurado (revisar NEXT_PUBLIC_SUPABASE_URL / ANON_KEY).');
      setLoadState('error');
      return;
    }

    let cancelled = false;

    const initMatch = async () => {
      setLoadState('loading');
      setErrorMessage(null);

      const { data: existing, error: fetchError } = await supabase
        .from('express_matches')
        .select('*')
        .eq('cancha_code', slug)
        .maybeSingle();

      if (cancelled) return;

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('[ExpressTv] fetch error:', fetchError);
        setErrorMessage(fetchError.message);
        setLoadState('error');
        return;
      }

      if (existing) {
        setMatch(normalizeExpressMatch(existing));
        setLoadState('ready');
        return;
      }

      const { data: created, error: insertError } = await supabase
        .from('express_matches')
        .insert([{ cancha_code: slug }])
        .select('*')
        .single();

      if (cancelled) return;

      if (insertError || !created) {
        console.error('[ExpressTv] insert error:', insertError);
        setErrorMessage(insertError?.message || 'No se pudo inicializar la cancha express.');
        setLoadState('error');
        return;
      }

      setMatch(normalizeExpressMatch(created));
      setLoadState('ready');
    };

    initMatch();

    const channel = supabase
      .channel(`express-${slug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'express_matches',
          filter: `cancha_code=eq.${slug}`,
        },
        (payload) => {
          if (cancelled) return;
          const row = payload.new as Record<string, unknown> | null;
          if (!row) return;
          setMatch(normalizeExpressMatch(row));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [slug, supabase]);

  if (loadState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <BouncingBall />
      </div>
    );
  }

  if (loadState === 'error' || !match) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-surface px-6 text-center text-white">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-padel-primary">
          Express Match
        </p>
        <p className="max-w-md text-sm text-neutral-400">
          {errorMessage || 'No se pudo cargar el marcador de esta cancha.'}
        </p>
      </div>
    );
  }

  const courtNum = slug.replace('fast-', '');

  if (!match.is_active) {
    const controlUrl = `${getExpressAppBaseUrl()}/express/control/${match.session_id}`;
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-surface px-6 text-white">
        <h1 className="mb-4 text-6xl font-black uppercase text-padel-primary">
          Cancha {courtNum}
        </h1>
        <p className="mb-10 text-xl font-medium text-neutral-400">
          Escanea para iniciar el marcador
        </p>
        <div className="rounded-3xl bg-white p-6 shadow-[0_0_60px_rgba(204,255,0,0.15)]">
          <QRCodeSVG value={controlUrl} size={320} level="H" />
        </div>
        <p className="mt-8 font-mono text-xs uppercase tracking-widest text-neutral-500">
          Sin registros · Plug &amp; Play
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen select-none flex-col bg-surface p-8 text-white">
      <div className="mb-4 flex items-center justify-between border-b border-neutral-800 pb-4 text-sm font-bold uppercase tracking-widest text-neutral-500">
        <span className="text-padel-primary">SMART PADEL 58</span>
        <span
          className={
            match.modo_puntos === 'tiebreak'
              ? 'animate-pulse text-red-500'
              : 'text-padel-primary'
          }
        >
          {match.modo_puntos === 'tiebreak'
            ? 'TIE-BREAK'
            : match.punto_de_oro
              ? 'PUNTO DE ORO'
              : 'VENTAJA'}
        </span>
        <span>PISTA {courtNum}</span>
      </div>

      <div className="flex flex-1 gap-8">
        <div className="flex flex-1 flex-col items-center justify-between rounded-[2rem] border border-neutral-800 bg-neutral-900 p-10">
          <h2 className="w-full truncate text-center text-5xl font-black uppercase">
            {match.team_a_name}
          </h2>
          <div className="text-[20rem] font-black leading-none text-padel-primary">
            {match.team_a_points}
          </div>
          <div className="text-4xl font-bold uppercase tracking-widest text-neutral-400">
            Juegos:{' '}
            <span className="ml-3 text-6xl text-white">{match.team_a_games}</span>
          </div>
        </div>

        <div className="flex w-40 flex-col justify-center gap-6">
          {[0, 1, 2].map((idx) => {
            const isCurrent = match.current_set === idx + 1;
            return (
              <div
                key={idx}
                className={`flex flex-col items-center rounded-2xl border py-6 ${
                  isCurrent
                    ? 'border-padel-primary/30 bg-padel-primary/10'
                    : 'border-neutral-800 bg-neutral-900'
                }`}
              >
                <span className="mb-3 text-xs font-bold text-neutral-500">SET {idx + 1}</span>
                <span
                  className={`text-4xl font-black ${
                    isCurrent ? 'text-padel-primary' : 'text-neutral-300'
                  }`}
                >
                  {match.sets_a?.[idx] ?? 0} - {match.sets_b?.[idx] ?? 0}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-1 flex-col items-center justify-between rounded-[2rem] border border-neutral-800 bg-neutral-900 p-10">
          <h2 className="w-full truncate text-center text-5xl font-black uppercase">
            {match.team_b_name}
          </h2>
          <div className="text-[20rem] font-black leading-none text-padel-primary">
            {match.team_b_points}
          </div>
          <div className="text-4xl font-bold uppercase tracking-widest text-neutral-400">
            Juegos:{' '}
            <span className="ml-3 text-6xl text-white">{match.team_b_games}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
