'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { notFound, useRouter, useSearchParams } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { QRCodeSVG } from 'qrcode.react';
import { Zap } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  ExpressMatch,
  getExpressAppBaseUrl,
  isValidExpressSlug,
  normalizeExpressMatch,
} from '@/types/expressMatch';
import { useCourtPlaylists } from '@/lib/useCourtPlaylists';
import { useCourtDisplayHeartbeat } from '@/lib/courtDisplayHeartbeat';
import { buildExpressTvTopLeft } from '@/lib/expressDisplayHeader';
import { resolveCanonicalExpressVenue } from '@/lib/expressVenueCourts';
import {
  expressBaseVenueFromPublicidadVenue,
  expressPlaylistVenueCandidates,
  expressPublicidadVenueName,
} from '@/lib/expressPublicidad';
import { expressQrDockPaddingBottom, EXPRESS_QR_CODE_SIZE_PX } from '@/lib/expressDisplayMediaScale';
import { expressQrWindowSecondsLeft, formatExpressQrCountdown, isExpressQrWindowOpen } from '@/lib/expressQrWindow';
import {
  canchaIdFromExpressSlug,
  courtNumFromExpressSlug,
  expressMatchToMarcador,
} from '@/lib/expressMatchToMarcador';
import {
  PistaTopBar,
  PizarraDisplayGlobalStyles,
  PizarraScoreboardFit,
  PizarraTableScoreboard,
} from '@/components/pizarra/PizarraDisplayParts';
import type { CourtPlaylistsState } from '@/lib/useCourtPlaylists';
import { BouncingBall } from '@/components/BouncingBall';
import { ExpressTvDeviceGate } from '@/components/express/ExpressTvDeviceGate';
import { ExpressTvPublicidadDock } from '@/components/express/ExpressTvPublicidadDock';
import { ExpressPlaylistDebug } from '@/components/express/ExpressPlaylistDebug';
import { ExpressMatchEndOverlay } from '@/components/express/ExpressMatchEndOverlay';
import { ExpressSideChangeBanner } from '@/components/express/ExpressSideChangeBanner';
import { PizarraWarmupOverlay } from '@/components/PizarraWarmupOverlay';
import {
  expressIsSideChangeVisible,
  expressIsWarmupActive,
  expressMatchChronoCron,
  expressMatchEndedSummary,
  expressWarmupEndsAtMs,
} from '@/lib/expressSessionMeta';
import { mergeExpressTickerMessages } from '@/lib/expressTickerMessages';
import {
  expressMatchSlugCodes,
  expressSlugDisplayLabel,
  isLegacyExpressSlug,
  normalizeExpressSlug,
} from '@/lib/expressSlug';
import { useThreeFingerDragExit } from '@/lib/useThreeFingerDragExit';

type LoadState = 'loading' | 'ready' | 'error';

export default function ExpressTvDisplay() {
  const slugRaw = useRouteSegment('slug');
  const slug = normalizeExpressSlug(slugRaw);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const complexParam = (searchParams.get('complex') || '').trim();
  const venueParam = (searchParams.get('venue') || '').trim();
  const urlBaseVenue =
    complexParam ||
    (venueParam ? expressBaseVenueFromPublicidadVenue(venueParam) : '');
  const minimalMode =
    searchParams.get('minimal') === '1' || searchParams.get('minimal') === 'true';
  const debugMode =
    searchParams.get('debug') === '1' || searchParams.get('debug') === 'true';

  const courtNum = courtNumFromExpressSlug(slug);
  const canchaId = canchaIdFromExpressSlug(slug);
  const boardLabel = expressSlugDisplayLabel(slug);

  useEffect(() => {
    if (!isValidExpressSlug(slugRaw) || !isLegacyExpressSlug(slugRaw)) return;
    const qs = searchParams.toString();
    router.replace(`/display/express/${slug}${qs ? `?${qs}` : ''}`);
  }, [slugRaw, slug, router, searchParams]);

  const [match, setMatch] = useState<ExpressMatch | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uiTick, setUiTick] = useState(() => Date.now());
  const syncedBaseVenueRef = useRef<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => setUiTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const effectiveBaseVenue = useMemo(() => {
    const raw = urlBaseVenue || String(match?.base_venue ?? '').trim();
    return resolveCanonicalExpressVenue(raw) ?? raw;
  }, [urlBaseVenue, match?.base_venue]);
  const playlistVenueCandidates = useMemo(
    () =>
      expressPlaylistVenueCandidates(
        effectiveBaseVenue,
        venueParam.includes('Express') ? venueParam : null,
      ),
    [effectiveBaseVenue, venueParam],
  );
  const playlistVenue = playlistVenueCandidates[0] ?? null;
  const playlistVenueFallbacks = useMemo(
    () => playlistVenueCandidates.slice(1),
    [playlistVenueCandidates],
  );
  const heartbeatVenue =
    effectiveBaseVenue.trim()
      ? expressPublicidadVenueName(effectiveBaseVenue)
      : playlistVenue;

  const expressTopLeft = useMemo(
    () => buildExpressTvTopLeft(effectiveBaseVenue, courtNum),
    [effectiveBaseVenue, courtNum],
  );

  const playlists = useCourtPlaylists(canchaId, playlistVenue, playlistVenueFallbacks);
  useCourtDisplayHeartbeat(canchaId, heartbeatVenue);
  useThreeFingerDragExit('/');

  const tickerStableRef = useRef<{ id: string; mensaje: string; highlight?: boolean }[]>([]);
  const tickerMessages = useMemo(() => {
    const merged = mergeExpressTickerMessages(
      playlists.tickerMessages,
      match?.display_ticker_phrases ?? [],
    );
    if (merged.length > 0) {
      tickerStableRef.current = merged;
      return merged;
    }
    return tickerStableRef.current;
  }, [playlists.tickerMessages, match?.display_ticker_phrases]);

  const marcador = useMemo(() => {
    if (!match) return null;
    if (match.is_active || expressMatchEndedSummary(match)) {
      return expressMatchToMarcador(match);
    }
    return null;
  }, [match]);

  const [qrTick, setQrTick] = useState(() => Date.now());

  useEffect(() => {
    if (!match?.qr_expires_at || match.is_active) return;

    const tick = () => setQrTick(Date.now());
    tick();

    const expMs = new Date(match.qr_expires_at).getTime();
    if (Number.isNaN(expMs)) return;

    const msLeft = expMs - Date.now();
    if (msLeft <= 0) return;

    const id = setInterval(tick, 1000);
    const timeoutId = setTimeout(tick, msLeft + 50);

    return () => {
      clearInterval(id);
      clearTimeout(timeoutId);
    };
  }, [match?.qr_expires_at, match?.is_active]);

  const wrapGate = (node: ReactNode) => (
    <ExpressTvDeviceGate clubSlug={effectiveBaseVenue} expressSlug={slug}>
      {node}
      {debugMode ? (
        <ExpressPlaylistDebug
          effectiveBaseVenue={effectiveBaseVenue}
          playlistVenue={playlistVenue}
          playlistVenueCandidates={playlistVenueCandidates}
          canchaId={canchaId}
          playlists={playlists}
        />
      ) : null}
    </ExpressTvDeviceGate>
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

      let existing: Record<string, unknown> | null = null;
      for (const code of expressMatchSlugCodes(slug)) {
        const { data, error: fetchError } = await supabase
          .from('express_matches')
          .select('*')
          .eq('cancha_code', code)
          .maybeSingle();

        if (cancelled) return;

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('[ExpressTv] fetch error:', fetchError);
          setErrorMessage(fetchError.message);
          setLoadState('error');
          return;
        }

        if (data) {
          existing = data as Record<string, unknown>;
          break;
        }
      }

      if (existing && String(existing.cancha_code ?? '') !== slug) {
        const { data: migrated } = await supabase
          .from('express_matches')
          .update({ cancha_code: slug })
          .eq('id', String(existing.id))
          .select('*')
          .maybeSingle();
        if (migrated) existing = migrated as Record<string, unknown>;
      }

      if (cancelled) return;

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

    return () => {
      cancelled = true;
    };
  }, [slug, supabase]);

  useEffect(() => {
    if (!supabase || !match?.id) return;

    const channel = supabase
      .channel(`express-match-${match.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'express_matches',
          filter: `id=eq.${match.id}`,
        },
        (payload) => {
          const row = payload.new as Record<string, unknown> | null;
          if (!row) return;
          setMatch(normalizeExpressMatch(row));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, supabase, match?.id]);

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

  if (!isValidExpressSlug(slugRaw)) {
    notFound();
  }

  const displayMediaScale = match?.display_media_scale ?? 1;
  const qrContentPaddingStyle = minimalMode
    ? undefined
    : { paddingBottom: expressQrDockPaddingBottom(displayMediaScale) };

  if (loadState === 'loading') {
    return wrapGate(
      <div className="relative flex h-screen w-full max-w-none min-w-0 flex-col overflow-hidden bg-[#050505] font-outfit text-white">
        <PistaTopBar
          courtHeadline=""
          levelLine=""
          genderLine=""
          expressTopLeft={expressTopLeft}
          suppressWaitBadge
          mode="wait"
        />
        <div
          className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center"
          style={qrContentPaddingStyle}
        >
          <BouncingBall />
        </div>
        <ExpressTvPublicidadDock
          canchaId={canchaId}
          baseVenue={effectiveBaseVenue}
          playlistVenue={playlistVenue}
          playlists={playlists}
          minimalMode={minimalMode}
          mediaScale={displayMediaScale}
          tickerMessages={tickerMessages}
          showDiagnostics={debugMode}
        />
        <PizarraDisplayGlobalStyles />
      </div>,
    );
  }

  if (loadState === 'error' || !match) {
    return wrapGate(
      <div className="flex h-screen flex-col items-center justify-center bg-[#050505] px-6 text-center text-white">
        <p className="mb-2 text-sm font-bold uppercase tracking-widest text-padel-primary">Express Match</p>
        <p className="max-w-md text-sm text-neutral-400">
          {errorMessage || 'No se pudo cargar el marcador de esta cancha.'}
        </p>
      </div>,
    );
  }

  const qrWindowOpen = isExpressQrWindowOpen(match, qrTick);
  const qrSecondsLeft = expressQrWindowSecondsLeft(match, qrTick);
  const endedSummary = expressMatchEndedSummary(match);
  const warmupEndsAt = match ? expressWarmupEndsAtMs(match) : null;
  const warmupActive = match ? expressIsWarmupActive(match, uiTick) : false;
  const sideChangeVisible = match ? expressIsSideChangeVisible(match, uiTick) : false;
  const matchChronoCron = match ? expressMatchChronoCron(match) : null;

  if (endedSummary && marcador) {
    return wrapGate(
      <div className="relative flex h-screen min-h-0 w-full max-w-none min-w-0 flex-col items-stretch overflow-hidden bg-[#050505] font-outfit text-white select-none">
        <PistaTopBar
          courtHeadline=""
          levelLine=""
          genderLine=""
          expressTopLeft={expressTopLeft}
          mode="live"
          goldenPoint={match.punto_de_oro}
          liveCenter="chrono"
          matchChronoCron={matchChronoCron}
        />
        <PizarraScoreboardFit expressMode>
          <div className="flex w-full min-h-0 flex-col items-center gap-2 overflow-visible px-1 pt-0">
            <PizarraTableScoreboard
              marcador={marcador}
              playerNameScale={match.display_name_scale}
              expressFullPlayerNames
              expressFlatPanel
            />
          </div>
        </PizarraScoreboardFit>
        <ExpressMatchEndOverlay match={match} />
        <ExpressTvPublicidadDock
          layout="inline"
          canchaId={canchaId}
          baseVenue={effectiveBaseVenue}
          playlistVenue={playlistVenue}
          playlists={playlists}
          minimalMode={minimalMode}
          mediaScale={match.display_media_scale}
          tickerMessages={tickerMessages}
          showDiagnostics={debugMode}
        />
        <PizarraDisplayGlobalStyles />
      </div>,
    );
  }

  if (!match.is_active) {
    const controlUrl = `${getExpressAppBaseUrl()}/express/control/${match.session_id}`;

    return wrapGate(
      <div className="relative flex h-screen w-full max-w-none min-w-0 flex-col overflow-hidden bg-[#050505] font-outfit text-white">
        <div className="pointer-events-none absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#ccff00_0%,_transparent_70%)]" />

        <PistaTopBar
          courtHeadline=""
          levelLine=""
          genderLine=""
          expressTopLeft={expressTopLeft}
          suppressWaitBadge
          mode="wait"
        />

        <div
          className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 overflow-hidden px-4 pb-3 pt-1 sm:gap-2"
          style={qrContentPaddingStyle}
        >
          {qrWindowOpen ? (
            <>
              {qrSecondsLeft != null && (
                <p className="shrink-0 text-center text-[9px] font-bold uppercase tracking-widest text-padel-primary">
                  QR activo · {formatExpressQrCountdown(qrSecondsLeft)}
                </p>
              )}

              <div className="mb-1 shrink-0 rounded-xl bg-white p-2 shadow-[0_0_28px_rgba(204,255,0,0.1)] sm:rounded-2xl sm:p-2.5">
                <QRCodeSVG
                  value={controlUrl}
                  size={EXPRESS_QR_CODE_SIZE_PX}
                  level="H"
                  className="block h-auto max-w-[min(24vw,104px)]"
                  style={{ width: EXPRESS_QR_CODE_SIZE_PX, height: 'auto' }}
                />
              </div>

              <p className="shrink-0 text-center text-[10px] font-black uppercase tracking-[0.38em] text-padel-primary sm:text-xs sm:tracking-[0.45em]">
                SCAN&amp;GO
              </p>
            </>
          ) : (
            <div className="max-w-md shrink-0 px-4 text-center">
              <p className="text-sm font-bold uppercase tracking-widest text-neutral-400">
                Esperando QR
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                El encargado del club puede habilitar el código desde Telegram (ventana de 5 minutos).
              </p>
            </div>
          )}
        </div>

        <ExpressTvPublicidadDock
          canchaId={canchaId}
          baseVenue={effectiveBaseVenue}
          playlistVenue={playlistVenue}
          playlists={playlists}
          minimalMode={minimalMode}
          mediaScale={displayMediaScale}
          tickerMessages={tickerMessages}
          showDiagnostics={debugMode}
        />

        <PizarraDisplayGlobalStyles />
      </div>,
    );
  }

  return wrapGate(
    <div className="relative flex h-screen min-h-0 w-full max-w-none min-w-0 flex-col items-stretch overflow-hidden bg-[#050505] font-outfit text-white select-none">
      <ExpressSideChangeBanner visible={sideChangeVisible && !warmupActive} layout="tv" />
      <PistaTopBar
        courtHeadline=""
        levelLine=""
        genderLine=""
        expressTopLeft={expressTopLeft}
        mode="live"
        goldenPoint={match.punto_de_oro && !warmupActive}
        liveCenter={warmupActive ? 'none' : 'chrono'}
        matchChronoCron={matchChronoCron}
      />

      {warmupActive ? (
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-[1] items-center justify-center border-b border-white/5 bg-[radial-gradient(circle_at_center,_rgba(204,255,0,0.06)_0%,_transparent_65%)]">
            <PizarraWarmupOverlay endsAt={warmupEndsAt} layout="express-top" />
          </div>
          <ExpressTvPublicidadDock
            layout="inline"
            fillHeight
            canchaId={canchaId}
            baseVenue={effectiveBaseVenue}
            playlistVenue={playlistVenue}
            playlists={playlists}
            minimalMode={minimalMode}
            mediaScale={match.display_media_scale}
            tickerMessages={tickerMessages}
            showDiagnostics={debugMode}
          />
        </div>
      ) : (
        <>
          {match.modo_puntos === 'tiebreak' && (
            <div className="flex shrink-0 items-center justify-center gap-2 border-b border-red-500/20 bg-red-500/10 py-1">
              <Zap className="h-3.5 w-3.5 text-red-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-red-400">Tie-break</span>
            </div>
          )}

          {match.modo_puntos === 'super_tiebreak' && (
            <div className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-500/10 py-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">
                Súper tie-break
              </span>
            </div>
          )}

          <PizarraScoreboardFit expressMode>
            <div className="flex w-full min-h-0 flex-col items-center gap-2 overflow-visible px-1 pt-0">
              {marcador ? (
                <PizarraTableScoreboard
                  marcador={marcador}
                  playerNameScale={match.display_name_scale}
                  expressFullPlayerNames
                  expressFlatPanel
                />
              ) : null}
            </div>
          </PizarraScoreboardFit>

          <ExpressTvPublicidadDock
            layout="inline"
            canchaId={canchaId}
            baseVenue={effectiveBaseVenue}
            playlistVenue={playlistVenue}
            playlists={playlists}
            minimalMode={minimalMode}
            mediaScale={match.display_media_scale}
            tickerMessages={tickerMessages}
            showDiagnostics={debugMode}
          />
        </>
      )}

      <PizarraDisplayGlobalStyles />
    </div>,
  );
}
