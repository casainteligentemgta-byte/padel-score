'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { notFound, useSearchParams } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { QRCodeSVG } from 'qrcode.react';
import { Megaphone, Zap } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  ExpressMatch,
  getExpressAppBaseUrl,
  isValidExpressSlug,
  normalizeExpressMatch,
} from '@/types/expressMatch';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';
import { useCourtDisplayHeartbeat } from '@/lib/courtDisplayHeartbeat';
import { buildCourtHeadline } from '@/lib/pizarraHeaderLabels';
import {
  expressBaseVenueFromPublicidadVenue,
  expressPlaylistVenueCandidates,
  expressPublicidadVenueName,
} from '@/lib/expressPublicidad';
import {
  canchaIdFromExpressSlug,
  courtNumFromExpressSlug,
  expressMatchToMarcador,
} from '@/lib/expressMatchToMarcador';
import {
  PistaTopBar,
  PizarraDisplayGlobalStyles,
  PizarraPublicidadFooter,
  PizarraScoreboardFit,
  PizarraTableScoreboard,
} from '@/components/pizarra/PizarraDisplayParts';
import { BouncingBall } from '@/components/BouncingBall';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';

type LoadState = 'loading' | 'ready' | 'error';

function expressScoringMeta(match: ExpressMatch): { levelLine: string; genderLine: string } {
  const levelLine = 'EXPRESS MATCH';
  let genderLine = match.punto_de_oro ? 'Punto de oro' : 'Ventaja clásica';
  if (match.modo_puntos === 'tiebreak') {
    genderLine = 'Tie-break';
  }
  return { levelLine, genderLine };
}

export default function ExpressTvDisplay() {
  const slug = useRouteSegment('slug');
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const complexParam = (searchParams.get('complex') || '').trim();
  const venueParam = (searchParams.get('venue') || '').trim();
  const urlBaseVenue =
    complexParam ||
    (venueParam ? expressBaseVenueFromPublicidadVenue(venueParam) : '');
  const minimalMode =
    searchParams.get('minimal') === '1' || searchParams.get('minimal') === 'true';

  const courtNum = courtNumFromExpressSlug(slug);
  const canchaId = canchaIdFromExpressSlug(slug);

  const [match, setMatch] = useState<ExpressMatch | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const syncedBaseVenueRef = useRef<string | null>(null);

  const effectiveBaseVenue =
    urlBaseVenue || String(match?.base_venue ?? '').trim();
  const playlistVenueCandidates = useMemo(
    () =>
      expressPlaylistVenueCandidates(
        effectiveBaseVenue,
        venueParam.includes('Express') ? venueParam : null,
      ),
    [effectiveBaseVenue, venueParam],
  );
  const playlistVenue = playlistVenueCandidates[0] ?? null;
  const playlistVenueFallbacks = playlistVenueCandidates.slice(1);
  const heartbeatVenue =
    effectiveBaseVenue.trim()
      ? expressPublicidadVenueName(effectiveBaseVenue)
      : playlistVenue;

  const courtHeadline = useMemo(() => {
    const base = buildCourtHeadline(effectiveBaseVenue || null, courtNum);
    return base.includes('Express') ? base : `${base} · Express`;
  }, [effectiveBaseVenue, courtNum]);

  const playlists = useCourtPlaylists(canchaId, playlistVenue, playlistVenueFallbacks);
  useCourtDisplayHeartbeat(canchaId, heartbeatVenue);
  useThreeFingerDragExit('/');

  const marcador = useMemo(
    () => (match?.is_active ? expressMatchToMarcador(match) : null),
    [match],
  );

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

      try {
        const res = await fetch(`/api/express-matches/${encodeURIComponent(slug)}`);
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok || !json.match) {
          const { data: created, error: insertError } = await supabase
            .from('express_matches')
            .insert([{ cancha_code: slug }])
            .select('*')
            .single();

          if (cancelled) return;

          if (insertError || !created) {
            setErrorMessage(
              String(json.error || insertError?.message || 'No se pudo crear la cancha express.') +
                ' — Ejecuta 056_express_matches.sql en Supabase.',
            );
            setLoadState('error');
            return;
          }

          setMatch(normalizeExpressMatch(created));
          setLoadState('ready');
          return;
        }

        setMatch(normalizeExpressMatch(json.match as Record<string, unknown>));
        setLoadState('ready');
      } catch (e) {
        if (cancelled) return;
        console.error('[ExpressTv] provision error:', e);
        setErrorMessage('Error de red al inicializar la cancha.');
        setLoadState('error');
      }
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

  useEffect(() => {
    if (!supabase || !match?.id || !urlBaseVenue.trim()) return;
    const target = urlBaseVenue.trim();
    const current = String(match.base_venue ?? '').trim();
    if (current === target || syncedBaseVenueRef.current === target) return;
    syncedBaseVenueRef.current = target;
    void supabase
      .from('express_matches')
      .update({ base_venue: target })
      .eq('cancha_code', slug)
      .then(({ error }) => {
        if (error) syncedBaseVenueRef.current = null;
      });
  }, [supabase, match?.id, match?.base_venue, urlBaseVenue, slug]);

  if (!isValidExpressSlug(slug)) {
    notFound();
  }

  if (loadState === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505]">
        <BouncingBall />
      </div>
    );
  }

  if (loadState === 'error' || !match) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#050505] px-6 text-center text-white">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-padel-primary">Express Match</p>
        <p className="max-w-md text-sm text-neutral-400">
          {errorMessage || 'No se pudo cargar el marcador de esta cancha.'}
        </p>
      </div>
    );
  }

  const { levelLine, genderLine } = expressScoringMeta(match);

  if (!match.is_active) {
    const controlUrl = `${getExpressAppBaseUrl()}/express/control/${match.session_id}`;

    return (
      <div className="relative flex h-screen w-full max-w-none min-w-0 flex-col overflow-hidden bg-[#050505] font-outfit text-white">
        <div className="pointer-events-none absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#ccff00_0%,_transparent_70%)]" />

        <PistaTopBar
          courtHeadline={courtHeadline}
          levelLine={levelLine}
          genderLine="Escanea el QR para jugar"
          mode="wait"
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-2 overflow-hidden px-4 py-2 sm:gap-3">
          <div className="shrink-0 text-center">
            <h1 className="mb-1 text-2xl font-black italic uppercase tracking-tighter sm:text-3xl">
              {slug.toUpperCase()}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gray-500 sm:text-xs sm:tracking-[0.35em]">
              Escanea para iniciar el marcador
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-white p-2.5 shadow-[0_0_40px_rgba(204,255,0,0.12)] sm:rounded-3xl sm:p-3">
            <QRCodeSVG value={controlUrl} size={148} level="H" className="block h-auto w-[148px] max-w-[min(36vw,148px)]" />
          </div>

          <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 sm:flex">
            <Megaphone className="h-4 w-4 shrink-0 text-padel-primary" />
            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
              Sin registro · Plug &amp; Play
            </p>
          </div>
        </div>

        <div className="relative z-20 flex w-full min-w-0 max-w-none shrink-0 flex-col items-stretch border-t border-white/10">
          <PizarraPublicidadFooter
            canchaId={canchaId}
            playlists={playlists}
            minimalMode={minimalMode}
          />
        </div>

        <PizarraDisplayGlobalStyles />
      </div>
    );
  }

  return (
    <div className="flex h-screen min-h-0 w-full max-w-none min-w-0 flex-col items-stretch overflow-hidden bg-[#050505] font-outfit text-white select-none">
      <PistaTopBar
        courtHeadline={courtHeadline}
        levelLine={levelLine}
        genderLine={genderLine}
        mode="live"
        goldenPoint={match.punto_de_oro}
        liveCenter="badge"
      />

      {match.modo_puntos === 'tiebreak' && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b border-red-500/20 bg-red-500/10 py-1">
          <Zap className="h-3.5 w-3.5 text-red-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400">Tie-break</span>
        </div>
      )}

      <PizarraScoreboardFit>
        <div className="flex w-full min-h-0 flex-col items-center gap-2 overflow-x-hidden px-1 pt-0">
          {marcador ? <PizarraTableScoreboard marcador={marcador} /> : null}
        </div>
      </PizarraScoreboardFit>

      <div className="relative z-10 w-full min-w-0 max-w-none flex-shrink-0 overflow-hidden border-t border-white/10">
        <PizarraPublicidadFooter canchaId={canchaId} playlists={playlists} minimalMode={minimalMode} />
      </div>

      <PizarraDisplayGlobalStyles />
    </div>
  );
}
