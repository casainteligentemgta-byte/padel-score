'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';
import {
  Activity,
  Monitor,
  ShieldAlert,
  Tv,
  Zap,
  CornerDownRight,
  LayoutGrid,
} from 'lucide-react';

type TvSession = {
  id: string;
  short_id: number;
  status: 'waiting' | 'active';
  current_view: string;
  tournament_id: string | null;
  updated_at?: string;
};

type TournamentOption = { id: string; name?: string; category?: string };

const VIEW_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'score_court_1', label: 'Marcador Cancha 1' },
  { value: 'score_court_2', label: 'Marcador Cancha 2' },
  { value: 'bracket', label: 'Cuadro General' },
  { value: 'ads', label: 'Publicidad' },
];

function viewNeedsTournament(view: string): boolean {
  return view !== 'ads';
}

export default function AdminScreensPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const bind = useMemo(() => {
    const raw = searchParams.get('bind');
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 1000 && n <= 9999 ? n : null;
  }, [searchParams]);

  const supabase = useMemo(() => {
    try {
      return getSupabaseClient();
    } catch {
      return null;
    }
  }, []);

  const [sessions, setSessions] = useState<TvSession[]>([]);
  const [tournaments, setTournaments] = useState<TournamentOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [draftByShortId, setDraftByShortId] = useState<
    Record<number, { tournamentId: string | null; view: string }>
  >({});

  const [sendingShortId, setSendingShortId] = useState<number | null>(null);

  const refreshTimeout = useRef<any>(null);

  const refreshSessions = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('tv_sessions')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    setSessions((data as TvSession[]) || []);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.push('/');
      return;
    }
    if (!supabase) return;

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const [, tList] = await Promise.all([refreshSessions(), dataService.listAllTournaments()]);
        if (cancelled) return;
        setTournaments((tList as any) || []);
      } catch (e) {
        // ignore: will show empty list
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAdmin, supabase]);

  // Real-time: cualquier cambio en tv_sessions refresca la lista
  useEffect(() => {
    if (!supabase) return;

    const scheduleRefresh = () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      refreshTimeout.current = setTimeout(() => {
        refreshSessions().catch(() => {});
      }, 200);
    };

    const channel = supabase
      .channel('tv_sessions_admin_all')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tv_sessions' },
        () => scheduleRefresh()
      )
      .subscribe();

    return () => {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Mantener draft local, inicializado desde la fila real (pero no “pisar” cambios si
  // el admin está preparando un envío mientras está en waiting).
  useEffect(() => {
    setDraftByShortId((prev) => {
      const next = { ...prev };
      for (const s of sessions) {
        const existing = next[s.short_id];
        if (!existing || s.status === 'active') {
          next[s.short_id] = {
            tournamentId: s.tournament_id ?? null,
            view: s.current_view ?? 'ads',
          };
        }
      }
      return next;
    });
  }, [sessions]);

  const sendConfig = async (shortId: number) => {
    if (!supabase) return;
    const draft = draftByShortId[shortId];
    if (!draft) return;
    if (sendingShortId === shortId) return;

    if (viewNeedsTournament(draft.view) && !draft.tournamentId) {
      alert('Selecciona un torneo para esta vista.');
      return;
    }

    setSendingShortId(shortId);
    try {
      await supabase
        .from('tv_sessions')
        .update({
          status: 'active',
          current_view: draft.view,
          tournament_id: draft.view === 'ads' ? null : draft.tournamentId,
        })
        .eq('short_id', shortId);

      await refreshSessions();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('sendConfig failed:', e);
      alert('No se pudo enviar la configuración a la TV.');
    } finally {
      setSendingShortId(null);
    }
  };

  const deactivateTv = async (shortId: number) => {
    if (!supabase) return;
    if (sendingShortId === shortId) return;

    setSendingShortId(shortId);
    try {
      await supabase
        .from('tv_sessions')
        .update({
          status: 'waiting',
          tournament_id: null,
          current_view: 'ads',
        })
        .eq('short_id', shortId);

      await refreshSessions();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('deactivateTv failed:', e);
      alert('No se pudo desactivar la TV.');
    } finally {
      setSendingShortId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Zap className="w-12 h-12 text-[#ccff00] animate-pulse" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center p-10">
        <div className="max-w-md text-center">
          <ShieldAlert className="w-20 h-20 text-red-500 mx-auto mb-6 opacity-20" />
          <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-500">Este panel es de uso exclusivo para Administradores.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white p-6 md:p-10 font-sans">
      <header className="mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4">
              <Tv className="w-10 h-10 text-[#ccff00]" />
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                CONTROL TV
              </h1>
            </div>
            <p className="mt-3 text-gray-500 text-sm uppercase tracking-widest font-black">
              QR: smartpadel58.com / admin / screens ? bind=XXXX
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-[2rem] px-6 py-4">
            <LayoutGrid className="w-5 h-5 text-[#ccff00]" />
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-gray-500">Conectadas</div>
              <div className="text-2xl font-black italic text-white leading-none">{sessions.length}</div>
            </div>
          </div>
        </div>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Zap className="w-10 h-10 text-[#ccff00] animate-spin" />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div className="py-28 text-center bg-white/5 border border-white/10 rounded-[3rem]">
          <Monitor className="w-16 h-16 mx-auto text-white/10 mb-5" />
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white/60">
            No hay TVs conectadas
          </h3>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">
            En la TV toca el QR / pega el código en el panel de control para activarla.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {sessions.map((s) => {
          const draft = draftByShortId[s.short_id] ?? {
            tournamentId: s.tournament_id ?? null,
            view: s.current_view ?? 'ads',
          };

          const isBind = bind != null && s.short_id === bind;
          const isSending = sendingShortId === s.short_id;
          const viewLabel = VIEW_OPTIONS.find((v) => v.value === draft.view)?.label ?? draft.view;

          return (
            <motion.div
              key={s.short_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 relative overflow-hidden ${
                isBind ? 'border-[#ccff00]/40 shadow-[0_0_50px_rgba(204,255,0,0.10)]' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-[52px] leading-none font-black italic text-[#ccff00]">
                    {s.short_id}
                  </div>
                  <div className="mt-2 text-xs font-black uppercase tracking-widest text-gray-500">
                    TV Session
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div
                    className={`px-4 py-2 rounded-full border text-xs font-black uppercase tracking-widest ${
                      s.status === 'active'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-white/5 border-white/10 text-gray-400'
                    }`}
                  >
                    {s.status === 'active' ? 'ACTIVE' : 'WAITING'}
                  </div>
                  <div className="text-xs font-black uppercase tracking-widest text-gray-500">
                    Vista: {viewLabel}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                      Vista
                    </div>
                    <select
                      value={draft.view}
                      onChange={(e) => {
                        const nextView = e.target.value;
                        setDraftByShortId((prev) => ({
                          ...prev,
                          [s.short_id]: {
                            ...draft,
                            view: nextView,
                            tournamentId: nextView === 'ads' ? null : draft.tournamentId,
                          },
                        }));
                      }}
                      className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 px-4 text-xs font-black italic uppercase tracking-widest focus:outline-none focus:border-[#ccff00]/50 transition-all appearance-none"
                    >
                      {VIEW_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                    Torneo
                  </div>
                  <select
                    value={draft.tournamentId ?? ''}
                    disabled={draft.view === 'ads'}
                    onChange={(e) => {
                      const nextTournamentId = e.target.value || null;
                      setDraftByShortId((prev) => ({
                        ...prev,
                        [s.short_id]: { ...draft, tournamentId: nextTournamentId },
                      }));
                    }}
                    className="w-full bg-[#111] border border-white/10 rounded-2xl py-3 px-4 text-xs font-black italic uppercase tracking-widest focus:outline-none focus:border-[#ccff00]/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">— Sin torneo —</option>
                    {tournaments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name ? String(t.name) : t.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => sendConfig(s.short_id)}
                    disabled={isSending}
                    className="flex-1 py-3 bg-[#ccff00] text-black rounded-2xl font-black italic uppercase tracking-widest hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
                    title="Enviar configuración y activar TV"
                  >
                    {isSending ? 'Enviando…' : s.status === 'active' ? 'Actualizar' : 'Activar'}
                  </button>

                  <button
                    type="button"
                    onClick={() => deactivateTv(s.short_id)}
                    disabled={isSending}
                    className="w-16 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-2xl font-black italic uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all disabled:opacity-50"
                    title="Desactivar TV (vuelve a QR)"
                  >
                    <span className="sr-only">Desactivar</span>
                    {isSending ? '—' : '⏸'}
                  </button>
                </div>

                {isBind && (
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#ccff00]">
                    <CornerDownRight className="w-4 h-4" />
                    QR vinculado (bind)
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#ccff00]" />
          <h2 className="text-xl font-black italic uppercase tracking-tighter">Cómo usarlo</h2>
        </div>
        <p className="mt-3 text-gray-500 text-sm leading-relaxed">
          Abre la pantalla TV en <span className="font-black text-white/70">/tv</span>, copia el código (o usa el QR).
          En este panel verás la TV conectada y podrás elegir <span className="text-[#ccff00] font-black">tournament</span> y vista.
          Cuando pulses <span className="font-black text-white">Activar</span>, la TV cambiará con transición suave.
        </p>
      </div>
    </div>
  );
}

