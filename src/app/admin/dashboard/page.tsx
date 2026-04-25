"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  UserPlus
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getAuthHeaders } from '@/lib/apiAuth';
import { useRouter } from 'next/navigation';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, trend, color }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#111] border border-white/5 rounded-2xl p-4 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${color}/20 transition-colors`} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl bg-${color}/10 border border-${color}/20`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        {trend && (
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-white/50 text-xs font-medium mb-1">{title}</h3>
      <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();
  const router = useRouter();
  
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
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
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

      setPayments(payRows);
      setPlayers(recentProfiles || []);
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

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/admin');
      return;
    }

    if (isAdmin) {
      fetchData();

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
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = null;
        }
        supabase!.removeChannel(channel);
      };
    }
  }, [isAdmin, authLoading, fetchData, router, scheduleRefresh, supabase]);

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
      return ref.includes(q) || name.includes(q) || phone.includes(q);
    });
  }, [payments, searchTerm]);
  const previewPayments = filteredPayments.slice(0, 3);
  const previewUsers = players.slice(0, 3);
  const previewInscriptions = inscriptions.slice(0, 3);
  const previewLogs = logs.slice(0, 3);

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
    <div className="h-screen overflow-hidden bg-[#050505] text-white p-3 md:p-4">
      <div className="sticky top-0 z-[200] w-full border-b border-padel-primary/20 bg-[#0a0a0a] shadow-lg shadow-black/40 -mx-3 md:-mx-4 px-3 md:px-4 mb-3 md:mb-4">
        <div className="max-w-7xl mx-auto py-3 flex items-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-5 rounded-xl bg-padel-primary text-black font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
            aria-label="Volver al panel de administración"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2.5} />
            Atrás
          </button>
        </div>
      </div>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="px-2 py-1 bg-padel-primary/10 border border-padel-primary/20 rounded text-[10px] font-bold text-padel-primary uppercase tracking-wider">
              Admin Dashboard
            </div>
            <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Padel Score <span className="text-padel-primary">PRO</span>
          </h1>
          <p className="text-white/50 text-sm font-medium">Centro de control y monitoreo en tiempo real.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {activeTab === 'payments' && (
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-padel-primary/60" />
            <input
              type="text"
              placeholder="Referencia, nombre, email o teléfono…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-padel-primary/40 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-padel-primary/50"
            />
          </div>
        )}
        <div className="flex items-center gap-3 sm:ml-auto">
          <button 
            onClick={() => fetchData()}
            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
            title="Sincronizar ahora"
          >
            <RefreshCcw className="w-5 h-5 text-white/70 group-active:rotate-180 transition-transform duration-500" />
          </button>
          <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block" />
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-padel-primary flex items-center justify-center font-bold text-black">
              AD
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white">Administrador</div>
              <div className="text-[10px] text-white/40">Sesión Activa</div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard 
          title={`Inscritos activos (${activeTournamentVenue})`} 
          value={stats.capacity > 0 ? `${stats.totalUsers} / ${stats.capacity}` : stats.totalUsers} 
          icon={Users} 
          trend={stats.capacity > 0 ? `Faltan ${Math.max(0, stats.capacity - stats.totalUsers)}` : undefined} 
          color="blue-500" 
        />
        <StatCard 
          title="Inscripciones Pagas" 
          value={stats.capacity > 0 ? `${stats.paidInscriptions} / ${stats.capacity}` : stats.paidInscriptions} 
          icon={CheckCircle2} 
          trend={stats.capacity > 0 ? `${Math.round((stats.paidInscriptions / Math.max(1, stats.capacity)) * 100)}%` : undefined} 
          color="emerald-500" 
        />
        <StatCard 
          title="Pagos Pendientes" 
          value={stats.capacity > 0 ? `${stats.pendingPayments} / ${stats.capacity}` : stats.pendingPayments} 
          icon={Clock} 
          trend={stats.capacity > 0 ? `${Math.round((stats.pendingPayments / Math.max(1, stats.capacity)) * 100)}%` : undefined}
          color="amber-500" 
        />
        <StatCard 
          title="Alertas de Pago" 
          value={stats.capacity > 0 ? `${stats.activeAlerts} / ${stats.capacity}` : stats.activeAlerts} 
          icon={AlertTriangle} 
          trend={stats.capacity > 0 ? `${Math.round((stats.activeAlerts / Math.max(1, stats.capacity)) * 100)}%` : undefined}
          color="rose-500" 
        />
      </div>

      {/* Listas compactas */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-290px)] md:h-[calc(100vh-305px)] grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-2 min-h-0 overflow-auto pr-1 space-y-4">
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
                <button onClick={() => setFullViewTab('payments')} className="text-[10px] font-black uppercase tracking-wider text-padel-primary hover:underline">Abrir pantalla completa</button>
              </div>
            </div>
            <div className="space-y-2">
              {previewPayments.map((p: any) => {
                const rawStatus = String(p.status || 'pending').toLowerCase();
                const statusLabel = rawStatus === 'paid' ? 'Verificado' : rawStatus === 'alert' ? 'Rechazado' : 'Comprobado';
                return (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">#{p.reference_number} · {p.bank_origin || 'Banco'}</p>
                      <p className="text-[11px] text-white/45 truncate">{p.phone_emitter || 'Sin teléfono'}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-padel-primary">{statusLabel}</span>
                  </div>
                );
              })}
              {previewPayments.length === 0 && <p className="text-sm text-white/40">Sin pagos para mostrar.</p>}
            </div>
          </section>

          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><UserCheck className="w-5 h-5 text-padel-primary" /> NUEVOS USUARIOS</h2>
              <button onClick={() => setFullViewTab('users')} className="text-[10px] font-black uppercase tracking-wider text-padel-primary hover:underline">Abrir pantalla completa</button>
            </div>
            <div className="space-y-2">
              {previewUsers.map((u: any) => (
                <div key={u.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                  <p className="text-sm font-bold truncate">{u.full_name || u.name || 'Jugador'}</p>
                  <p className="text-[11px] text-white/45 truncate">{u.email || 'Sin email'}</p>
                </div>
              ))}
              {previewUsers.length === 0 && <p className="text-sm text-white/40">Sin usuarios nuevos.</p>}
            </div>
          </section>

          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold flex items-center gap-2"><UserPlus className="w-5 h-5 text-padel-primary" /> EQUIPOS INSCRITOS</h2>
              <button onClick={() => setFullViewTab('inscriptions')} className="text-[10px] font-black uppercase tracking-wider text-padel-primary hover:underline">Abrir pantalla completa</button>
            </div>
            <div className="space-y-2">
              {previewInscriptions.map((item: any) => {
                const d = (item.data || {}) as { partnerName?: string };
                const partner = String(d.partnerName || '').trim();
                const lead = String(item.participant_name || 'Jugador').trim();
                return (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                    <p className="text-sm font-bold truncate">{partner ? `${lead} / ${partner}` : lead}</p>
                    <p className="text-[11px] text-white/45 truncate">{item.tournament_name || 'Torneo'} · {item.category_key || '—'}</p>
                  </div>
                );
              })}
              {previewInscriptions.length === 0 && <p className="text-sm text-white/40">Sin equipos inscritos recientes.</p>}
            </div>
          </section>
        </div>

        <div className="min-h-0 overflow-auto pr-1 space-y-4">
          <section className="bg-[#111] border border-white/5 rounded-3xl p-4">
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
              <button onClick={() => setFullViewTab('logs')} className="text-[10px] font-black uppercase tracking-wider text-padel-primary hover:underline">Abrir pantalla completa</button>
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
                <button onClick={() => setFullViewTab(null)} className="px-3 py-1.5 rounded-lg bg-padel-primary text-black text-xs font-black uppercase">Cerrar</button>
              </div>
              <div className="p-4 overflow-auto min-h-0">
                {fullViewTab === 'payments' && (
                  <div className="space-y-2">
                    {filteredPayments.map((p: any) => (
                      <div key={p.id} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">#{p.reference_number} · {p.bank_origin || 'Banco'}</p>
                          <p className="text-[11px] text-white/50 truncate">{p.phone_emitter || 'Sin teléfono'} · {p.amount_bs ?? '—'} Bs.</p>
                        </div>
                        <span className="text-[10px] font-black uppercase text-padel-primary">{String(p.status || 'pending')}</span>
                      </div>
                    ))}
                  </div>
                )}
                {fullViewTab === 'users' && (
                  <div className="space-y-2">
                    {players.map((u: any) => (
                      <div key={u.id} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                        <p className="text-sm font-bold truncate">{u.full_name || u.name || 'Jugador'}</p>
                        <p className="text-[11px] text-white/50 truncate">{u.email || 'Sin email'} · {u.role || 'player'}</p>
                      </div>
                    ))}
                  </div>
                )}
                {fullViewTab === 'inscriptions' && (
                  <div className="space-y-2">
                    {inscriptions.map((item: any) => {
                      const d = (item.data || {}) as { partnerName?: string };
                      const partner = String(d.partnerName || '').trim();
                      const lead = String(item.participant_name || 'Jugador').trim();
                      return (
                        <div key={item.id} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                          <p className="text-sm font-bold truncate">{partner ? `${lead} / ${partner}` : lead}</p>
                          <p className="text-[11px] text-white/50 truncate">
                            {item.tournament_name || 'Torneo'} · {item.category_key || '—'} · {item.payment_status || 'pending'}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
                {fullViewTab === 'logs' && (
                  <div className="space-y-2">
                    {logs.map((l: any) => (
                      <div key={l.id} className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
                        <p className="text-[11px] text-padel-primary uppercase">{l.level || 'info'} · {l.module || 'sistema'}</p>
                        <p className="text-[11px] text-white/50 line-clamp-2">{l.message}</p>
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
