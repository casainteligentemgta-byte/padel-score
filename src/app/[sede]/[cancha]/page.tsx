'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Monitor, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { SEDE_CODE_TO_VENUE } from '@/lib/pizarraShortUrl';
import {
  buildExpressDisplayPathFromShortUrl,
  expressVenuePathSlug,
  isExpressShortCourtValid,
  parseExpressCourtPathSegment,
  resolveExpressVenueFromPathSlug,
} from '@/lib/expressShortUrl';

type RouteKind = 'tournament' | 'express' | 'invalid';
type State = 'loading' | 'redirecting' | 'not_found' | 'invalid';

export default function ShortUrlPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sedeRaw = (params?.sede as string ?? '').trim();
  const canchaRaw = (params?.cancha as string ?? '').trim();
  const sedeUpper = sedeRaw.toUpperCase();
  const canchaUpper = canchaRaw.toUpperCase();

  const route = useMemo((): {
    kind: RouteKind;
    complexName?: string;
    expressVenue?: string;
    courtNumber?: number;
  } => {
    const courtNumber = parseExpressCourtPathSegment(canchaUpper);
    if (courtNumber == null) return { kind: 'invalid' };

    const sedeMatch = sedeUpper.match(/^S(\d+)$/);
    if (sedeMatch) {
      const complexName = SEDE_CODE_TO_VENUE[sedeUpper];
      if (!complexName) return { kind: 'invalid' };
      return { kind: 'tournament', complexName, courtNumber };
    }

    const expressVenue = resolveExpressVenueFromPathSlug(sedeRaw);
    if (expressVenue && isExpressShortCourtValid(expressVenue, courtNumber)) {
      return { kind: 'express', expressVenue, courtNumber };
    }

    return { kind: 'invalid' };
  }, [sedeRaw, sedeUpper, canchaUpper]);

  const [state, setState] = useState<State>(route.kind === 'invalid' ? 'invalid' : 'loading');

  useEffect(() => {
    if (route.kind === 'invalid') {
      setState('invalid');
      return;
    }

    setState('redirecting');
    const qp = new URLSearchParams(searchParams?.toString() || '');

    if (route.kind === 'tournament' && route.complexName && route.courtNumber) {
      qp.set('complex', route.complexName);
      qp.set('courtId', String(route.courtNumber));
      router.replace(`/dev/pizarra-concept?${qp.toString()}`);
      return;
    }

    if (route.kind === 'express' && route.expressVenue && route.courtNumber) {
      router.replace(
        buildExpressDisplayPathFromShortUrl(route.expressVenue, route.courtNumber),
      );
    }
  }, [route, router, searchParams]);

  const sedeLabel = route.kind === 'express' && route.expressVenue
    ? expressVenuePathSlug(route.expressVenue)
    : sedeUpper;
  const canchaLabel = canchaUpper;
  const venueName =
    route.kind === 'express'
      ? route.expressVenue
      : route.kind === 'tournament'
        ? route.complexName
        : '';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-4 font-outfit">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ccff00]">
          <Monitor className="h-5 w-5 text-black" />
        </div>
        <span className="text-lg font-black uppercase tracking-widest text-white">Smart Padel</span>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-[#ccff00]/30 bg-[#ccff00]/5 px-5 py-2.5">
        <MapPin className="h-4 w-4 shrink-0 text-[#ccff00]" />
        <span className="text-sm font-black uppercase tracking-widest text-[#ccff00]">
          {sedeLabel} / {canchaLabel}
        </span>
        {venueName ? (
          <span className="ml-1 hidden text-xs font-bold text-white/40 sm:inline">— {venueName}</span>
        ) : null}
      </div>

      {(state === 'loading' || state === 'redirecting') && (
        <div className="flex flex-col items-center gap-3 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#ccff00]" />
          <p className="text-sm font-bold uppercase tracking-widest text-white/60">
            {route.kind === 'express' ? 'Abriendo pizarra Express…' : 'Abriendo pizarra…'}
          </p>
        </div>
      )}

      {state === 'not_found' && (
        <div className="flex max-w-xs flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-yellow-400" />
          <p className="text-sm font-black uppercase tracking-widest text-white">Sin partido activo</p>
        </div>
      )}

      {state === 'invalid' && (
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-sm font-black uppercase tracking-widest text-white">URL no válida</p>
          <p className="text-xs font-medium text-white/40">
            Express: <span className="font-mono text-[#ccff00]">smartpadel58.com/BD/C1</span>
          </p>
          <p className="text-xs font-medium text-white/40">
            Torneo (legacy): <span className="font-mono text-[#ccff00]">smartpadel58.com/S1/C2</span>
          </p>
        </div>
      )}
    </div>
  );
}
