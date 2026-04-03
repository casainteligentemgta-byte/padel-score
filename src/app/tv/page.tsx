'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Monitor, Tv, Zap } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

type TvSession = {
    id: string;
    short_id: number;
    status: 'waiting' | 'active';
    current_view: string;
    tournament_id: string | null;
    updated_at?: string;
};

function randomShortId(): number {
    // 4 dígitos (1000–9999)
    return Math.floor(1000 + Math.random() * 9000);
}

function getIframeSrc(session: TvSession | null): string | null {
    if (!session) return null;
    if (session.current_view === 'ads') return '/display/ads';

    if (session.current_view === 'bracket') {
        if (!session.tournament_id) return null;
        return `/tournaments/${session.tournament_id}/display/bracket`;
    }

    if (session.current_view === 'score_court_1') {
        if (!session.tournament_id) return null;
        return `/tournaments/${session.tournament_id}/display/court/1`;
    }

    if (session.current_view === 'score_court_2') {
        if (!session.tournament_id) return null;
        return `/tournaments/${session.tournament_id}/display/court/2`;
    }

    // Fallback si mandan un valor genérico.
    if (session.current_view === 'score') {
        if (!session.tournament_id) return null;
        return `/tournaments/${session.tournament_id}/display/court/1`;
    }

    return null;
}

export default function TVKioskPage() {
    const supabase = useMemo(() => {
        try {
            return getSupabaseClient();
        } catch {
            return null;
        }
    }, []);

    const [shortId, setShortId] = useState<number | null>(null);
    const [session, setSession] = useState<TvSession | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    // 1) Crear/asegurar fila de esta TV.
    useEffect(() => {
        if (!supabase) {
            setSyncError('Supabase no configurado (revisar env NEXT_PUBLIC_SUPABASE_URL/ANON_KEY).');
            return;
        }

        let cancelled = false;

        const init = async () => {
            setSyncError(null);

            for (let attempt = 0; attempt < 6; attempt++) {
                const candidate = randomShortId();
                try {
                    const res = await supabase
                        .from('tv_sessions')
                        .upsert(
                            {
                                short_id: candidate,
                                status: 'waiting',
                                current_view: 'ads',
                                tournament_id: null,
                            },
                            { onConflict: 'short_id' }
                        )
                        .select('*')
                        .maybeSingle();

                    if (cancelled) return;
                    if (res?.data?.short_id) {
                        setShortId(res.data.short_id);
                        setSession(res.data as TvSession);
                        return;
                    }
                } catch {
                    // Puede ser colisión de short_id o RLS.
                    continue;
                }
            }

            if (!cancelled) {
                setSyncError('No se pudo generar un short_id válido para esta TV.');
            }
        };

        init();
        return () => {
            cancelled = true;
        };
    }, [supabase]);

    // 2) Realtime (Realtime por fila con filter = short_id).
    useEffect(() => {
        if (!supabase || !shortId) return;

        let channel: any = null;
        let cancelled = false;

        const start = async () => {
            try {
                const { data } = await supabase
                    .from('tv_sessions')
                    .select('*')
                    .eq('short_id', shortId)
                    .maybeSingle();
                if (!cancelled) setSession(data as TvSession | null);
            } catch {
                // ignore
            }

            channel = supabase
                .channel(`tv_sessions_${shortId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'tv_sessions',
                        filter: `short_id=eq.${shortId}`,
                    },
                    (payload: any) => {
                        if (cancelled) return;
                        const next = payload?.new as TvSession | null;
                        setSession(next);
                    }
                )
                .subscribe();
        };

        start();

        return () => {
            cancelled = true;
            if (channel) supabase.removeChannel(channel);
        };
    }, [supabase, shortId]);

    const isActive = session?.status === 'active';
    const iframeSrc = useMemo(() => getIframeSrc(session), [session]);
    /** Texto para QR: identificador de esta TV (configuración vía Supabase `tv_sessions`, sin pantalla admin). */
    const qrValue = useMemo(
        () =>
            shortId
                ? `Smart Padel TV · short_id=${shortId} · Configura torneo y vista en Supabase (tabla tv_sessions).`
                : '',
        [shortId],
    );

    return (
        <div className="fixed inset-0 bg-black text-white overflow-hidden select-none font-outfit">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap');
                body {
                    margin: 0;
                    padding: 0;
                    background: #000;
                }
                .font-digital {
                    font-family: 'Orbitron', sans-serif;
                    letter-spacing: 0.02em;
                }
            `}</style>

            <AnimatePresence mode="wait">
                {!shortId || !session ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-full w-full flex flex-col items-center justify-center p-10 text-center"
                    >
                        <Zap className="w-12 h-12 text-[#ccff00] animate-pulse" />
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.4em] text-gray-500">
                            Generando TV…
                        </p>
                        {syncError && <p className="mt-6 text-sm text-red-400 max-w-xl">{syncError}</p>}
                    </motion.div>
                ) : isActive ? (
                    <motion.div
                        key={`active_${session.current_view}`}
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-0"
                    >
                        {iframeSrc ? (
                            <iframe
                                title="TV Display"
                                src={iframeSrc}
                                className="absolute inset-0 w-full h-full border-0 bg-black"
                                allowFullScreen
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center">
                                <Monitor className="w-14 h-14 text-[#ccff00] opacity-60" />
                                <h2 className="mt-6 text-2xl font-black italic uppercase">
                                    Falta configuración (tournament_id)
                                </h2>
                                <p className="mt-3 text-gray-500 max-w-xl">
                                    Activa la fila en tv_sessions (tournament_id y vista) en Supabase o desde tu panel interno.
                                </p>
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="qr"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full w-full flex flex-col items-center justify-center p-10 relative"
                    >
                        <div className="absolute inset-0 opacity-25">
                            <div className="absolute top-[-30%] left-[-20%] w-[55%] h-[55%] rounded-full blur-[90px] bg-[#ccff00]/30" />
                            <div className="absolute bottom-[-30%] right-[-20%] w-[55%] h-[55%] rounded-full blur-[110px] bg-blue-600/15" />
                        </div>

                        <div className="relative z-10 w-full max-w-[980px] flex flex-col items-center">
                            <div className="flex items-center gap-4 mb-10">
                                <Tv className="w-8 h-8 text-[#ccff00] opacity-70" />
                                <span className="text-xs font-black uppercase tracking-[0.5em] text-gray-500">
                                    Conectar TV
                                </span>
                            </div>

                            <div className="text-[clamp(72px,10vw,170px)] leading-none font-digital font-black uppercase tracking-tighter text-[#ccff00] drop-shadow-[0_0_30px_rgba(204,255,0,0.25)]">
                                {shortId}
                            </div>

                            <div className="mt-6 text-center max-w-xl mx-auto">
                                <p className="text-[clamp(14px,1.8vw,22px)] font-bold uppercase tracking-widest text-white/75 leading-snug">
                                    Código de pantalla (tabla tv_sessions en Supabase)
                                </p>
                                <p className="mt-2 text-xs font-black uppercase tracking-[0.35em] text-gray-500">
                                    El QR guarda este texto para copiarlo o archivarlo
                                </p>
                            </div>

                            <div className="mt-10 bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
                                <div className="flex items-center justify-center">
                                    <QRCodeSVG
                                        value={qrValue}
                                        size={320}
                                        bgColor="#000000"
                                        fgColor="#ccff00"
                                        level="M"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="mt-6 text-sm font-black uppercase tracking-[0.3em] text-gray-500">
                                    Código: {shortId}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
