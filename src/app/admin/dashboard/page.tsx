"use client";

import { useState, useEffect, useCallback, useMemo, useRef, type ComponentType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CreditCard, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search,
  RefreshCcw,
  ArrowUpRight,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  UserPlus,
  Server,
  Database,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getAuthHeaders } from '@/lib/apiAuth';
import { type ParticipantDataSlice } from '@/lib/participantDataExtract';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
  compact?: boolean;
}

function paymentStatusLabel(status: unknown) {
  const raw = String(status || 'pending').toLowerCase();
  if (raw === 'paid') return 'Verificado';
  if (raw === 'alert') return 'Rechazado';
  return 'Comprobado';
}

function inscriptionPaymentLabel(status: unknown) {
  const raw = String(status || 'pending').toLowerCase();
  if (raw === 'paid') return 'Pagado';
  if (raw === 'exonerado') return 'Exonerado';
  if (raw === 'rechazado') return 'Rechazado';
  if (raw === 'revision') return 'En revisión';
  if (raw === 'alert') return 'Alerta';
  return 'Pendiente';
}

function firstNameToken(full: string): string {
  const t = full.trim().split(/\s+/).filter(Boolean);
  return t[0] || '';
}

function nameTokensAfterFirst(full: string): string {
  const t = full.trim().split(/\s+/).filter(Boolean);
  return t.slice(1).join(' ').trim();
}

type ServiceHealth = 'loading' | 'ok' | 'warn' | 'error';

function HealthPill({
  label,
  status,
  icon: Icon,
  hint,
}: {
  label: string;
  status: ServiceHealth;
  icon: ComponentType<{ className?: string }>;
  hint: string;
}) {
  const dotClass =
    status === 'loading'
      ? 'bg-white/50 animate-pulse'
      : status === 'ok'
        ? 'bg-emerald-400'
        : status === 'warn'
          ? 'bg-amber-400'
          : 'bg-red-500';
  const statusText =
    status === 'loading' ? '…' : status === 'ok' ? 'OK' : status === 'warn' ? 'Parcial' : 'Error';

  return (
    <div
      className="inline-flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-md bg-white/5 border border-white/10"
      title={`${hint} · ${statusText}`}
    >
      <Icon className="w-3.5 h-3.5 text-padel-primary/80 shrink-0" aria-hidden />
      <span className="text-[9px] font-bold uppercase text-white/45 leading-none">{label}</span>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} title={statusText} />
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, trend, color, compact }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={
      compact
        ? 'bg-[#111] border border-white/5 rounded-xl p-2.5 sm:p-3 relative overflow-hidden group min-h-0'
        : 'bg-[#111] border border-white/5 rounded-2xl p-4 relative overflow-hidden group'
    }
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${color}/20 transition-colors`} />
    <div className="relative z-10">
      <div className={`flex justify-between items-start ${compact ? 'mb-1.5' : 'mb-3'}`}>
        <div className={compact ? `p-1.5 rounded-lg bg-${color}/10 border border-${color}/20` : `p-2.5 rounded-xl bg-${color}/10 border border-${color}/20`}>
          <Icon className={compact ? `w-4 h-4 text-${color}` : `w-5 h-5 text-${color}`} />
        </div>
        {trend && (
          <span
            className={
              compact
                ? 'text-[8px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 max-w-[4.5rem] truncate'
                : 'text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1'
            }
            title={trend}
          >
            <ArrowUpRight className={compact ? 'w-2.5 h-2.5 shrink-0' : 'w-3 h-3'} />
            {trend}
          </span>
        )}
      </div>
      <h3
        className={
          compact
            ? 'text-white/50 text-[9px] sm:text-[10px] font-medium mb-0.5 leading-tight line-clamp-2'
            : 'text-white/50 text-xs font-medium mb-1'
        }
      >
        {title}
      </h3>
      <div className={compact ? 'text-base sm:text-lg font-bold text-white tracking-tight tabular-nums' : 'text-2xl font-bold text-white tracking-tight'}>
        {value}
      </div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading, user, profile } = useAuth();
  const supabase = getSupabaseClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'logs' | 'inscriptions'>('payments');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidInscriptions: 0,
    pendingPayments: 0,
    activeAlerts: 0,
    capacity: 0,
  });
  const [activeTournamentVenue, setActiveTournamentVenue] = useState('—');
  const [serviceHealth, setServiceHealth] = useState<{
    server: ServiceHealth;
    clientDb: ServiceHealth;
    apiAdmin: ServiceHealth;
  }>({
    server: 'loading',
    clientDb: 'loading',
    apiAdmin: 'loading',
  });

  const [players, setPlayers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [fullViewTab, setFullViewTab] = useState<'payments' | 'users' | 'inscriptions' | 'logs' | null>(null);
  const [needsAttention, setNeedsAttention] = useState({
    payments: false,
    users: false,
    logs: false,
    inscriptions: false,
  });
  const isFetchingRef = useRef(false);
  const pendingRefreshRef = useRef(false);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasBootstrappedFeedRef = useRef(false);
  const activeTabRef = useRef<'payments' | 'users' | 'logs' | 'inscriptions'>('payments');
  const latestFeedStampRef = useRef({
    payments: '',
    users: '',
    logs: '',
    inscriptions: '',
  });

  const handleGoBack = useCallback(() => {
    router.push('/admin');
  }, [router]);

  useEffect(() => {
    activeTabRef.current = activeTab;
    setNeedsAttention((prev) => ({ ...prev, [activeTab]: false }));
  }, [activeTab]);

  const fetchData = useCallback(async () => {
    if (!supabase) return;

    if (isFetchingRef.current) {
      pendingRefreshRef.current = true;
      return;
    }

    isFetchingRef.current = true;
    try {
      const authHeaders = await getAuthHeaders();
      let payRows: any[] = [];
      const paymentsRes = await fetch('/api/admin/payment-logs', { headers: authHeaders });
      if (paymentsRes.ok) {
        const j = await paymentsRes.json();
        payRows = Array.isArray(j) ? j : [];
      }

      const [
        { data: activeTournament },
        { data: recentProfiles },
        { data: recentLogs },
        { data: recentInscriptions },
        { data: recentErrors },
      ] = await Promise.all([
        supabase
          .from('tournaments')
          .select('id, data, status, created_at')
          .in('status', ['active', 'registration_open'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(20),
        supabase
          .from('inscriptions')
          .select('id, tournament_name, category_key, participant_name, payment_status, inscription_status, data, created_at')
          .order('created_at', { ascending: false })
          .limit(30),
        supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      let activeTournamentUsers = 0;
      let paidPlayers = 0;
      let pendingPlayers = 0;
      let alertPlayers = 0;
      let totalCapacity = 0;
      if (activeTournament?.id) {
        const { data: activeRows } = await supabase
          .from('inscriptions')
          .select('payment_status, data')
          .eq('tournament_id', activeTournament.id);

        const rows = activeRows || [];
        const playersForRow = (r: any) => {
          const d = (r?.data || {}) as Record<string, unknown>;
          const hasPartner = Boolean(
            (typeof d.partnerId === 'string' && String(d.partnerId).trim() !== '') ||
            (typeof d.partnerName === 'string' && String(d.partnerName).trim() !== '')
          );
          return hasPartner ? 2 : 1;
        };

        activeTournamentUsers = rows.reduce((acc, r: any) => acc + playersForRow(r), 0);
        paidPlayers = rows
          .filter((r: any) => String(r.payment_status || '').toLowerCase() === 'paid')
          .reduce((acc, r: any) => acc + playersForRow(r), 0);
        pendingPlayers = rows
          .filter((r: any) => String(r.payment_status || '').toLowerCase() === 'pending')
          .reduce((acc, r: any) => acc + playersForRow(r), 0);
        alertPlayers = rows
          .filter((r: any) => String(r.payment_status || '').toLowerCase() === 'alert')
          .reduce((acc, r: any) => acc + playersForRow(r), 0);

        const td = ((activeTournament as any)?.data || {}) as Record<string, unknown>;
        const categories = (td.inscriptionCategories || td.categories || []) as Array<Record<string, unknown>>;
        totalCapacity = categories.reduce((acc, c) => {
          const n = Number(c.maxSlots ?? 0);
          return acc + (Number.isFinite(n) && n > 0 ? n : 0);
        }, 0);
      }
      const venueName = String(
        (activeTournament as any)?.data?.complexName ||
        (activeTournament as any)?.data?.venueName ||
        (activeTournament as any)?.data?.venue ||
        '—'
      ).trim() || '—';
      setActiveTournamentVenue(venueName);

      setStats({
        totalUsers: activeTournamentUsers,
        paidInscriptions: paidPlayers,
        pendingPayments: pendingPlayers,
        activeAlerts: alertPlayers,
        capacity: totalCapacity,
      });

      // Ficha (nombre/apellido/tel) vive en `participants.data`; `profiles` suele traer solo `name` y email.
      // Categoría/torneo: inscripción más reciente por `user_id` o `owner_id` (el filtro `.in.(uuid,…)` en PostgREST
      // no es fiable; usamos varias cláusulas `.eq` unidas con OR).
      let playersWithInscription: any[] = recentProfiles || [];
      if (playersWithInscription.length > 0) {
        const profileIds = playersWithInscription.map((p: any) => p?.id).filter(Boolean) as string[];

        const participantByProfileId = new Map<string, ParticipantDataSlice>();
        if (profileIds.length > 0) {
          try {
            const partRes = await fetch('/api/admin/dashboard-user-row-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...authHeaders },
              body: JSON.stringify({ profileIds }),
            });
            if (partRes.ok) {
              const partJson = (await partRes.json().catch(() => ({}))) as {
                byProfileId?: Record<string, ParticipantDataSlice>;
              };
              for (const [k, v] of Object.entries(partJson.byProfileId || {})) {
                if (k) participantByProfileId.set(k, v);
              }
            } else {
              const t = await partRes.text().catch(() => '');
              console.warn('[dashboard] dashboard-user-row-data:', partRes.status, t);
            }
          } catch (e) {
            console.warn('[dashboard] dashboard-user-row-data', e);
          }
        }

        const orInscription = profileIds.flatMap((id) => [`user_id.eq.${id}`, `owner_id.eq.${id}`]).join(',');
        const { data: insForProfiles, error: insOrErr } = orInscription
          ? await supabase
              .from('inscriptions')
              .select('user_id, owner_id, category_key, tournament_name, data, created_at')
              .or(orInscription)
          : { data: null, error: null as any };

        if (insOrErr) {
          console.warn('[dashboard] inscriptions (nuevos usuarios):', insOrErr.message);
        }

        const bestByProfile = new Map<
          string,
          { category_key: string | null; tournament_name: string | null; created_at: string }
        >();
        for (const row of insForProfiles || []) {
          const r = row as {
            user_id?: string | null;
            owner_id?: string | null;
            category_key?: string | null;
            tournament_name?: string | null;
            data?: unknown;
            created_at?: string | null;
          };
          const created = String(r.created_at || '');
          const insData =
            r.data && typeof r.data === 'object' && !Array.isArray(r.data)
              ? (r.data as Record<string, unknown>)
              : {};
          const catKey =
            (r.category_key && String(r.category_key)) ||
            (typeof insData.category_key === 'string' ? insData.category_key : null) ||
            (typeof insData.categoryKey === 'string' ? insData.categoryKey : null) ||
            null;
          const tName =
            (r.tournament_name && String(r.tournament_name)) ||
            (typeof insData.tournament_name === 'string' ? insData.tournament_name : null) ||
            (typeof insData.tournamentName === 'string' ? insData.tournamentName : null) ||
            null;
          const candidates = [r.user_id, r.owner_id].filter(
            (x): x is string => typeof x === 'string' && x.length > 0 && profileIds.includes(x)
          );
          for (const uid of new Set(candidates)) {
            const prev = bestByProfile.get(uid);
            if (!prev || created > (prev.created_at || '')) {
              bestByProfile.set(uid, {
                category_key: catKey,
                tournament_name: tName,
                created_at: created,
              });
            }
          }
        }
        playersWithInscription = playersWithInscription.map((p: any) => {
          const hit = p?.id ? bestByProfile.get(p.id) : undefined;
          const part = p?.id ? participantByProfileId.get(p.id) : undefined;
          return {
            ...p,
            inscriptionCategory: hit?.category_key ?? null,
            inscriptionTournament: hit?.tournament_name ?? null,
            participantName: part?.name,
            participantLastName: part?.lastName,
            participantPhone: part?.phone,
          };
        });
      }

      setPayments(payRows);
      setPlayers(playersWithInscription);
      setLogs(recentLogs || []);
      setInscriptions(recentInscriptions || []);
      setErrorLogs(recentErrors || []);

      const latestStamp = {
        payments: payRows?.[0]?.created_at ? String(payRows[0].created_at) : '',
        users: recentProfiles?.[0]?.created_at ? String(recentProfiles[0].created_at) : '',
        logs: recentLogs?.[0]?.timestamp ? String(recentLogs[0].timestamp) : '',
        inscriptions: recentInscriptions?.[0]?.created_at ? String(recentInscriptions[0].created_at) : '',
      };

      if (!hasBootstrappedFeedRef.current) {
        latestFeedStampRef.current = latestStamp;
        hasBootstrappedFeedRef.current = true;
      } else {
        (['payments', 'users', 'logs', 'inscriptions'] as const).forEach((key) => {
          const prev = latestFeedStampRef.current[key];
          const next = latestStamp[key];
          if (next && prev && next !== prev && activeTabRef.current !== key) {
            setNeedsAttention((old) => ({ ...old, [key]: true }));
          }
        });
        latestFeedStampRef.current = latestStamp;
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      isFetchingRef.current = false;
      if (pendingRefreshRef.current) {
        pendingRefreshRef.current = false;
        void fetchData();
        return;
      }
      setLoading(false);
    }
  }, [supabase]);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }
    refreshTimerRef.current = setTimeout(() => {
      void fetchData();
    }, 350);
  }, [fetchData]);

  const checkServicesHealth = useCallback(async () => {
    let server: ServiceHealth = 'error';
    let clientDb: ServiceHealth = 'error';
    let apiAdmin: ServiceHealth = 'error';

    try {
      const hRes = await fetch('/api/health', { cache: 'no-store' });
      if (hRes.ok) {
        const j = (await hRes.json()) as { supabase?: string };
        if (j.supabase === 'ok') server = 'ok';
        else if (j.supabase === 'unconfigured') server = 'warn';
        else server = 'error';
      } else {
        server = 'error';
      }
    } catch {
      server = 'error';
    }

    if (supabase) {
      const { error } = await supabase.from('tournaments').select('id').limit(1);
      clientDb = error ? 'error' : 'ok';
    }

    try {
      const authHeaders = await getAuthHeaders();
      const pRes = await fetch('/api/admin/payment-logs', { headers: authHeaders, cache: 'no-store' });
      if (pRes.ok) apiAdmin = 'ok';
      else if (pRes.status === 501) apiAdmin = 'warn';
      else apiAdmin = 'error';
    } catch {
      apiAdmin = 'error';
    }

    setServiceHealth({ server, clientDb, apiAdmin });
  }, [supabase]);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin');
      return;
    }

    if (isAdmin) {
      fetchData();
      void checkServicesHealth();

      const healthInterval = setInterval(() => {
        void checkServicesHealth();
      }, 90_000);

      // Realtime subscriptions
      const channel = supabase!
        .channel('admin_dashboard_realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_logs' }, scheduleRefresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, scheduleRefresh)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'inscriptions' }, scheduleRefresh)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, scheduleRefresh)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'error_logs' }, scheduleRefresh)
        .subscribe();

      return () => {
        clearInterval(healthInterval);
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
        supabase!.removeChannel(channel);
      };
    }
  }, [isAdmin, authLoading, checkServicesHealth, fetchData, router, scheduleRefresh, supabase]);

  /** Enlace desde pagos: abrir equipos inscritos y centrar la fila (URL limpia tras el scroll). */
  useEffect(() => {
    const panel = searchParams.get('panel');
    const focus = searchParams.get('focus')?.trim();
    if (panel !== 'inscriptions' || !focus) return;

    setFullViewTab('inscriptions');
    const t = window.setTimeout(() => {
      document.getElementById(`inscription-row-${focus}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      router.replace('/admin/dashboard', { scroll: false });
    }, 500);
    return () => window.clearTimeout(t);
  }, [searchParams, router]);

  const filteredPayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter((p: any) => {
      const pr = p.profiles;
      const u = Array.isArray(pr) ? pr[0] : pr;
      const name = [u?.full_name, u?.name, u?.email]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const ref = String(p.reference_number || '').toLowerCase();
      const phone = String(p.phone_emitter || '').toLowerCase();
      const payer =
        [p.payerName, p.payerLastName, p.payerDni].filter(Boolean).join(' ').toLowerCase();
      return ref.includes(q) || name.includes(q) || phone.includes(q) || payer.includes(q);
    });
  }, [payments, searchTerm]);
  const previewPayments = filteredPayments.slice(0, 3);
  const previewUsers = players.slice(0, 3);
  const previewInscriptions = inscriptions.slice(0, 3);
  const previewLogs = logs.slice(0, 3);

  const adminDisplayName = useMemo(() => {
    const n = String(
      (profile as { name?: string; full_name?: string } | null)?.name ||
        (profile as { full_name?: string } | null)?.full_name ||
        user?.displayName ||
        '',
    ).trim();
    return n || 'Administrador';
  }, [profile, user]);

  const adminEmail = String(user?.email || (profile as { email?: string } | null)?.email || '').trim();
  const adminInitials = useMemo(() => {
    const parts = adminDisplayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
    }
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return 'AD';
  }, [adminDisplayName]);

  const handleApprovePaymentLog = async (id: string) => {
    if (!supabase || !id) return;
    setApprovingId(id);
    try {
      const authHeaders = await getAuthHeaders();
      const r = await fetch('/api/admin/payment-logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ id, status: 'paid' }),
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || 'No se pudo aprobar el pago.');
      }
      await fetchData();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'No se pudo aprobar el pago.');
    } finally {
      setApprovingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
          <p className="text-white/50 animate-pulse font-medium">Cargando tablero central...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#050505] text-white flex flex-col p-3 md:p-4 min-h-0">
      <header className="shrink-0 z-[200] w-full border-b border-padel-primary/20 bg-[#0a0a0a] shadow-lg shadow-black/40 -mx-3 md:-mx-4 px-3 md:px-4">
        <div className="max-w-7xl mx-auto py-2.5 md:py-3.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleGoBack}
                className="shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] px-3 sm:px-4 rounded-xl bg-black border border-padel-primary/45 text-padel-primary font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-padel-primary/10 active:scale-[0.98] transition-all"
                aria-label="Volver al panel de administración"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                Atrás
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                  PADEL SCORE <span className="text-padel-primary">PRO</span>
                </h1>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-padel-primary/10 border border-padel-primary/20 rounded text-[10px] font-bold text-padel-primary uppercase tracking-wider">
                    Admin Dashboard
                  </span>
                  <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </div>
                </div>
                <p className="text-white/50 text-xs sm:text-sm font-medium mt-1.5">
                  Centro de control y monitoreo en tiempo real.
                </p>
              </div>
            </div>

            <div className="w-full lg:w-auto lg:max-w-[22rem] shrink-0 flex flex-col items-stretch lg:items-end gap-2.5 self-stretch">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-padel-primary/60" />
                <input
                  type="search"
                  name="q"
                  inputMode="search"
                  autoComplete="off"
                  placeholder="Buscar: referencia, nombre, email o teléfono (pagos)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#111] border border-padel-primary/40 rounded-full py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-padel-primary/50"
                />
              </div>
              <div className="flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    void fetchData();
                    void checkServicesHealth();
                  }}
                  className="shrink-0 p-2.5 sm:p-3 bg-black border border-padel-primary/30 rounded-xl hover:bg-padel-primary/10 transition-colors group"
                  title="Sincronizar ahora"
                  aria-label="Sincronizar ahora"
                >
                  <RefreshCcw className="w-5 h-5 text-padel-primary/80 group-active:rotate-180 transition-transform duration-500" />
                </button>
                <div className="flex min-w-0 max-w-full items-center gap-2.5 sm:gap-3 bg-white/5 border border-white/10 p-2 sm:p-2.5 rounded-xl pl-2">
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-padel-primary flex items-center justify-center text-[10px] sm:text-xs font-black text-black shrink-0"
                    aria-hidden
                  >
                    {adminInitials}
                  </div>
                  <div className="min-w-0 text-left sm:text-right">
                    <p className="text-[11px] sm:text-xs font-bold text-white truncate" title={adminDisplayName}>
                      {adminDisplayName}
                    </p>
                    {adminEmail ? (
                      <p
                        className="text-[9px] sm:text-[10px] text-white/45 truncate max-w-[11rem] sm:max-w-[14rem]"
                        title={adminEmail}
                      >
                        {adminEmail}
                      </p>
                    ) : (
                      <p className="text-[9px] sm:text-[10px] text-white/35">Sesión activa</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="mt-2.5 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5"
            role="status"
            aria-label="Estado de servicios"
          >
            <span className="w-full sm:w-auto text-[9px] font-bold text-white/35 uppercase tracking-wider sm:mr-0.5">
              Servicios
            </span>
            <HealthPill
              label="Servidor"
              status={serviceHealth.server}
              icon={Server}
              hint="Conexión del backend a Supabase (service role)"
            />
            <HealthPill
              label="Supabase"
              status={serviceHealth.clientDb}
              icon={Database}
              hint="Lectura desde el navegador (anon, RLS)"
            />
            <HealthPill
              label="API pagos"
              status={serviceHealth.apiAdmin}
              icon={CreditCard}
              hint="Endpoint de administración de comprobantes"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex-1 min-h-0 flex flex-col gap-2 md:gap-3 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4 flex-1 min-h-0">
        <div className="order-1 lg:order-1 lg:col-span-2 min-h-0 flex flex-col overflow-y-auto pr-0.5 sm:pr-1 space-y-3 [scrollbar-gutter:stable]">
          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-padel-primary" /> PAGOS</h2>
              <div className="flex items-center gap-2">
                <a
                  href="/admin/validacion-pagos"
                  className="inline-flex items-center justify-center rounded-lg border border-padel-primary/35 bg-padel-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-padel-primary hover:bg-padel-primary/20"
                >
                  Validación de pagos
                </a>
                <button onClick={() => setFullViewTab('payments')} className="rounded-lg border border-padel-primary/35 bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-padel-primary hover:bg-padel-primary/10">Abrir pantalla completa</button>
              </div>
            </div>
            <div className="space-y-1 min-w-0 overflow-x-auto">
              <div className="grid min-w-[640px] grid-cols-6 gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-padel-primary/80">
                <span>Nombre</span>
                <span>Apellido</span>
                <span>Cédula</span>
                <span className="min-w-0">Referencia</span>
                <span>Monto</span>
                <span>Estado</span>
              </div>
              {previewPayments.map((p: any, idx: number) => {
                const refShort = `#${p.reference_number || '—'}`;
                const refTitle = `${refShort} · ${p.bank_origin || 'Banco'}`;
                const statusLabel = paymentStatusLabel(p.status);
                return (
                  <div key={p.id} className={`rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}>
                    <div className="grid min-w-[640px] grid-cols-6 gap-2 text-[10px] leading-tight">
                      <p className="truncate font-bold">{p.payerName || '—'}</p>
                      <p className="truncate text-white/80">{p.payerLastName || '—'}</p>
                      <p className="truncate text-white/70 font-mono">{p.payerDni || '—'}</p>
                      <p className="truncate font-bold min-w-0 text-padel-primary/90" title={refTitle}>{refShort}</p>
                      <p className="truncate text-white/70">{p.amount_bs != null && p.amount_bs !== '' ? `${p.amount_bs} Bs.` : '—'}</p>
                      <p className="truncate font-black uppercase text-padel-primary">{statusLabel}</p>
                    </div>
                  </div>
                );
              })}
              {previewPayments.length === 0 && <p className="text-sm text-white/40">Sin pagos para mostrar.</p>}
            </div>
          </section>

          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-padel-primary" /> NUEVOS USUARIOS</h2>
              <button onClick={() => setFullViewTab('users')} className="rounded-lg border border-padel-primary/35 bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-padel-primary hover:bg-padel-primary/10">Abrir pantalla completa</button>
            </div>
            <div className="space-y-1">
              <div className="grid grid-cols-5 gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-padel-primary/80">
                <span>Nombre</span>
                <span>Apellido</span>
                <span>Teléfono</span>
                <span>Email</span>
                <span className="min-w-0">Categoría</span>
              </div>
              {previewUsers.map((u: any, idx: number) => {
                const catCell = [u.inscriptionTournament, u.inscriptionCategory].filter(Boolean).join(' · ') || '—';
                const full = String(u.name || u.full_name || '');
                const firstN = String(u.participantName || firstNameToken(full) || 'Jugador').trim() || 'Jugador';
                const lastN = String(
                  u.participantLastName || u.last_name || u.lastName || nameTokensAfterFirst(full)
                ).trim() || '—';
                const phoneN = String(u.participantPhone || u.phone || u.whatsapp || '').trim() || '—';
                return (
                <div key={u.id} className={`rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}>
                  <div className="grid grid-cols-5 gap-2 text-[10px] leading-tight">
                    <p className="truncate font-bold" title={firstN}>{firstN}</p>
                    <p className="truncate text-white/80" title={lastN}>{lastN}</p>
                    <p className="truncate text-white/70" title={phoneN}>{phoneN}</p>
                    <p className="truncate text-white/70">{u.email || '—'}</p>
                    <p className="truncate text-white/70 min-w-0" title={catCell}>{catCell}</p>
                  </div>
                </div>
                );
              })}
              {previewUsers.length === 0 && <p className="text-sm text-white/40">Sin usuarios nuevos.</p>}
            </div>
          </section>

          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-padel-primary" /> EQUIPOS INSCRITOS</h2>
              <button onClick={() => setFullViewTab('inscriptions')} className="rounded-lg border border-padel-primary/35 bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-padel-primary hover:bg-padel-primary/10">Abrir pantalla completa</button>
            </div>
            <div className="space-y-1 min-w-0">
              <div className="grid grid-cols-4 gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-padel-primary/80">
                <span className="min-w-0">Equipo</span>
                <span className="min-w-0">Torneo</span>
                <span>Categoría</span>
                <span>Pago</span>
              </div>
              {previewInscriptions.map((item: any, idx: number) => {
                const d = (item.data || {}) as { partnerName?: string };
                const partner = String(d.partnerName || '').trim();
                const lead = String(item.participant_name || 'Jugador').trim();
                const teamCell = partner ? `${lead} / ${partner}` : lead;
                const payLabel = inscriptionPaymentLabel(item.payment_status);
                return (
                  <div key={item.id} className={`rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}>
                    <div className="grid grid-cols-4 gap-2 text-[10px] leading-tight">
                      <p className="truncate font-bold min-w-0" title={teamCell}>{teamCell}</p>
                      <p className="truncate text-white/70 min-w-0">{item.tournament_name || '—'}</p>
                      <p className="truncate text-white/70">{item.category_key || '—'}</p>
                      <p className="truncate font-black uppercase text-padel-primary">{payLabel}</p>
                    </div>
                  </div>
                );
              })}
              {previewInscriptions.length === 0 && <p className="text-sm text-white/40">Sin equipos inscritos recientes.</p>}
            </div>
          </section>
        </div>

        <aside className="order-2 lg:order-2 min-h-0 flex flex-col gap-2.5 md:gap-3 overflow-y-auto pr-0.5 sm:pr-1 [scrollbar-gutter:stable]">
          <div className="grid grid-cols-2 gap-2 shrink-0">
            <StatCard
              title={`Inscritos activos (${activeTournamentVenue})`}
              value={stats.capacity > 0 ? `${stats.totalUsers} / ${stats.capacity}` : stats.totalUsers}
              icon={Users}
              trend={stats.capacity > 0 ? `Faltan ${Math.max(0, stats.capacity - stats.totalUsers)}` : undefined}
              color="blue-500"
              compact
            />
            <StatCard
              title="Inscripciones pagas"
              value={stats.capacity > 0 ? `${stats.paidInscriptions} / ${stats.capacity}` : stats.paidInscriptions}
              icon={CheckCircle2}
              trend={stats.capacity > 0 ? `${Math.round((stats.paidInscriptions / Math.max(1, stats.capacity)) * 100)}%` : undefined}
              color="emerald-500"
              compact
            />
            <StatCard
              title="Pagos pendientes"
              value={stats.capacity > 0 ? `${stats.pendingPayments} / ${stats.capacity}` : stats.pendingPayments}
              icon={Clock}
              trend={stats.capacity > 0 ? `${Math.round((stats.pendingPayments / Math.max(1, stats.capacity)) * 100)}%` : undefined}
              color="amber-500"
              compact
            />
            <StatCard
              title="Alerta de pago"
              value={stats.capacity > 0 ? `${stats.activeAlerts} / ${stats.capacity}` : stats.activeAlerts}
              icon={AlertTriangle}
              trend={stats.capacity > 0 ? `${Math.round((stats.activeAlerts / Math.max(1, stats.capacity)) * 100)}%` : undefined}
              color="rose-500"
              compact
            />
          </div>

          <section className="bg-[#111] border border-white/5 rounded-3xl p-4 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-rose-500" /> Errores de pantalla</h2>
              <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full">{errorLogs.length}</span>
            </div>
            <div className="space-y-2">
              {errorLogs.slice(0, 3).map((err: any) => (
                <div key={err.id} className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                  <p className="text-[11px] text-rose-300 truncate">{err.cancha_id || 'Global'}</p>
                  <p className="text-[11px] text-white/55 line-clamp-2">{err.error_message}</p>
                </div>
              ))}
              {errorLogs.length === 0 && <p className="text-sm text-white/40">Sin errores registrados.</p>}
            </div>
          </section>

          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-padel-primary" /> Logs del sistema</h2>
              <button onClick={() => setFullViewTab('logs')} className="rounded-lg border border-padel-primary/35 bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-padel-primary hover:bg-padel-primary/10">Abrir pantalla completa</button>
            </div>
            <div className="space-y-2">
              {previewLogs.map((l: any) => (
                <div key={l.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <p className="text-[11px] text-padel-primary uppercase">{l.level || 'info'} · {l.module || 'sistema'}</p>
                  <p className="text-[11px] text-white/55 line-clamp-2">{l.message}</p>
                </div>
              ))}
              {previewLogs.length === 0 && <p className="text-sm text-white/40">Sin logs recientes.</p>}
            </div>
          </section>
        </aside>
        </div>
      </div>

      <AnimatePresence>
        {fullViewTab && (
          <motion.div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="max-w-7xl mx-auto h-full bg-[#0b0b0b] border border-white/10 rounded-3xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-widest text-padel-primary">
                  {fullViewTab === 'payments' && 'Pagos'}
                  {fullViewTab === 'users' && 'Nuevos usuarios'}
                  {fullViewTab === 'inscriptions' && 'Equipos inscritos'}
                  {fullViewTab === 'logs' && 'Logs del sistema'}
                </h3>
                <button onClick={() => setFullViewTab(null)} className="px-3 py-1.5 rounded-lg bg-black border border-padel-primary/45 text-padel-primary text-xs font-black uppercase hover:bg-padel-primary/10">Cerrar</button>
              </div>
              <div className="p-4 overflow-auto min-h-0">
                {fullViewTab === 'payments' && (
                  <div className="space-y-1 min-w-0 overflow-x-auto">
                    <div className="grid min-w-[720px] grid-cols-7 gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-padel-primary/80">
                      <span>Nombre</span>
                      <span>Apellido</span>
                      <span>Cédula</span>
                      <span className="min-w-0">Referencia</span>
                      <span>Monto</span>
                      <span>Estado</span>
                      <span className="min-w-0">Equipo</span>
                    </div>
                    {filteredPayments.map((p: any, idx: number) => {
                      const refShort = `#${p.reference_number || '—'}`;
                      const refTitle = `${refShort} · ${p.bank_origin || 'Banco'}`;
                      const statusLabel = paymentStatusLabel(p.status);
                      const insId = p.linkedInscriptionId ? String(p.linkedInscriptionId) : '';
                      return (
                        <div key={p.id} className={`rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}>
                          <div className="grid min-w-[720px] grid-cols-7 gap-2 text-[10px] leading-tight">
                            <p className="truncate font-bold">{p.payerName || '—'}</p>
                            <p className="truncate text-white/80">{p.payerLastName || '—'}</p>
                            <p className="truncate text-white/70 font-mono">{p.payerDni || '—'}</p>
                            <p className="truncate font-bold min-w-0 text-padel-primary/90" title={refTitle}>{refShort}</p>
                            <p className="truncate text-white/70">{p.amount_bs != null && p.amount_bs !== '' ? `${p.amount_bs} Bs.` : '—'}</p>
                            <p className="truncate font-black uppercase text-padel-primary">{statusLabel}</p>
                            <div className="min-w-0 truncate">
                              {insId ? (
                                <Link
                                  href={`/admin/dashboard?panel=inscriptions&focus=${encodeURIComponent(insId)}`}
                                  className="font-black uppercase text-padel-primary underline decoration-padel-primary/40 underline-offset-2 hover:text-white"
                                >
                                  Ver equipo
                                </Link>
                              ) : (
                                <span className="text-white/35">—</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {fullViewTab === 'users' && (
                  <div className="space-y-1 min-w-0">
                    <div className="grid grid-cols-5 gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-padel-primary/80">
                      <span>Nombre</span>
                      <span>Apellido</span>
                      <span>Teléfono</span>
                      <span>Email</span>
                      <span className="min-w-0">Categoría</span>
                    </div>
                    {players.map((u: any, idx: number) => {
                      const catCell = [u.inscriptionTournament, u.inscriptionCategory].filter(Boolean).join(' · ') || '—';
                      const full = String(u.name || u.full_name || '');
                      const firstN = String(u.participantName || firstNameToken(full) || 'Jugador').trim() || 'Jugador';
                      const lastN = String(
                        u.participantLastName || u.last_name || u.lastName || nameTokensAfterFirst(full)
                      ).trim() || '—';
                      const phoneN = String(u.participantPhone || u.phone || u.whatsapp || '').trim() || '—';
                      return (
                      <div key={u.id} className={`rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}>
                        <div className="grid grid-cols-5 gap-2 text-[10px] leading-tight">
                          <p className="truncate font-bold" title={firstN}>{firstN}</p>
                          <p className="truncate text-white/80" title={lastN}>{lastN}</p>
                          <p className="truncate text-white/70" title={phoneN}>{phoneN}</p>
                          <p className="truncate text-white/70">{u.email || '—'}</p>
                          <p className="truncate text-white/70 min-w-0" title={catCell}>{catCell}</p>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
                {fullViewTab === 'inscriptions' && (
                  <div className="space-y-1 min-w-0">
                    <div className="grid grid-cols-4 gap-2 px-3 text-[10px] font-black uppercase tracking-widest text-padel-primary/80">
                      <span className="min-w-0">Equipo</span>
                      <span className="min-w-0">Torneo</span>
                      <span>Categoría</span>
                      <span>Pago</span>
                    </div>
                    {inscriptions.map((item: any, idx: number) => {
                      const d = (item.data || {}) as { partnerName?: string };
                      const partner = String(d.partnerName || '').trim();
                      const lead = String(item.participant_name || 'Jugador').trim();
                      const teamCell = partner ? `${lead} / ${partner}` : lead;
                      const payLabel = inscriptionPaymentLabel(item.payment_status);
                      return (
                        <div
                          id={`inscription-row-${item.id}`}
                          key={item.id}
                          className={`scroll-mt-4 rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}
                        >
                          <div className="grid grid-cols-4 gap-2 text-[10px] leading-tight">
                            <p className="truncate font-bold min-w-0" title={teamCell}>{teamCell}</p>
                            <p className="truncate text-white/70 min-w-0">{item.tournament_name || '—'}</p>
                            <p className="truncate text-white/70">{item.category_key || '—'}</p>
                            <p className="truncate font-black uppercase text-padel-primary">{payLabel}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {fullViewTab === 'logs' && (
                  <div className="space-y-1">
                    {logs.map((l: any, idx: number) => (
                      <div key={l.id} className={`rounded-lg border px-3 py-1.5 ${idx % 2 === 0 ? 'border-zinc-500/30 bg-zinc-200/10' : 'border-zinc-800 bg-black'}`}>
                        <p className="text-[11px] text-padel-primary uppercase">{l.level || 'info'} · {l.module || 'sistema'}</p>
                        <p className="text-[10px] text-white/55 line-clamp-2">{l.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
