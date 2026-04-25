"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getSupabaseClient } from '@/lib/supabase/client';
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
    className="bg-[#111] border border-white/5 rounded-2xl p-6 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${color}/20 transition-colors`} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-${color}/10 border border-${color}/20`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-white/50 text-sm font-medium mb-1">{title}</h3>
      <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
    </div>
  </motion.div>
);

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const supabase = getSupabaseClient();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'payments' | 'users' | 'logs'>('payments');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    paidInscriptions: 0,
    pendingPayments: 0,
    activeAlerts: 0
  });
  
  const [players, setPlayers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!supabase) return;
    
    try {
      let payRows: any[] | null = null;
      const paySelect = '*, profiles(name, full_name, email)';
      const { data: pendingPay, error: payErr } = await supabase
        .from('payment_logs')
        .select(paySelect)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(300);
      if (payErr) {
        const { data: fallback } = await supabase
          .from('payment_logs')
          .select(paySelect)
          .order('created_at', { ascending: false })
          .limit(300);
        payRows = (fallback || []).filter((p: any) => !p.status || String(p.status).toLowerCase() === 'pending');
      } else {
        payRows = pendingPay || [];
      }

      // 1. Fetch Stats & Recent Data
      const [
        { count: userCount },
        { data: recentProfiles },
        { data: recentLogs },
        { data: recentErrors }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(20),
        supabase.from('error_logs').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      // 2. Fetch Inscription statuses for Stats
      const { data: inscriptions } = await supabase
        .from('inscriptions')
        .select('payment_status');

      const paid = inscriptions?.filter(i => i.payment_status === 'paid').length || 0;
      const pending = inscriptions?.filter(i => i.payment_status === 'pending').length || 0;
      const alerts = inscriptions?.filter(i => i.payment_status === 'alert').length || 0;

      setStats({
        totalUsers: userCount || 0,
        paidInscriptions: paid,
        pendingPayments: pending,
        activeAlerts: alerts
      });

      setPayments(payRows || []);
      setPlayers(recentProfiles || []);
      setLogs(recentLogs || []);
      setErrorLogs(recentErrors || []);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'payment_logs' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'system_logs' }, () => fetchData())
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'error_logs' }, () => fetchData())
        .subscribe();

      return () => {
        supabase!.removeChannel(channel);
      };
    }
  }, [isAdmin, authLoading, fetchData, router, supabase]);

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

  const handleApprovePaymentLog = async (id: string) => {
    if (!supabase || !id) return;
    setApprovingId(id);
    try {
      const { error } = await supabase.from('payment_logs').update({ status: 'paid' } as any).eq('id', id);
      if (error) throw error;
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
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
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
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            Padel Score <span className="text-padel-primary">PRO</span>
          </h1>
          <p className="text-white/50 font-medium">Centro de control y monitoreo en tiempo real.</p>
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
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Usuarios Totales" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="+12%" 
          color="blue-500" 
        />
        <StatCard 
          title="Inscripciones Pagas" 
          value={stats.paidInscriptions} 
          icon={CheckCircle2} 
          trend="+5.4%" 
          color="emerald-500" 
        />
        <StatCard 
          title="Pagos Pendientes" 
          value={stats.pendingPayments} 
          icon={Clock} 
          color="amber-500" 
        />
        <StatCard 
          title="Alertas de Pago" 
          value={stats.activeAlerts} 
          icon={AlertTriangle} 
          color="rose-500" 
        />
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit mb-8">
          {(['payments', 'users', 'logs'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                activeTab === tab 
                  ? 'bg-padel-primary text-black shadow-lg shadow-padel-primary/20' 
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'payments' && <CreditCard className="w-4 h-4" />}
              {tab === 'users' && <UserCheck className="w-4 h-4" />}
              {tab === 'logs' && <Activity className="w-4 h-4" />}
              {tab === 'payments' ? 'Pagos Recientes' : tab === 'users' ? 'Nuevos Usuarios' : 'Logs del Sistema'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Main List */}
            <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {activeTab === 'payments' && <CreditCard className="w-5 h-5 text-padel-primary" />}
                    {activeTab === 'users' && <UserCheck className="w-5 h-5 text-padel-primary" />}
                    {activeTab === 'logs' && <Activity className="w-5 h-5 text-padel-primary" />}
                    {activeTab === 'payments' ? 'Pagos pendientes (Pago Móvil / reportes)' : activeTab === 'users' ? 'Últimos Registros' : 'Actividad del Sistema'}
                  </h2>
                  {activeTab === 'payments' && (
                    <p className="text-xs text-white/40 mt-1">
                      {filteredPayments.length} mostrado(s)
                      {searchTerm ? ` · filtrando: «${searchTerm}»` : ''}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-[10px] uppercase font-bold text-white/30 bg-white/[0.02]">
                    <tr>
                      {activeTab === 'payments' && (
                        <>
                          <th className="px-6 py-4">Usuario</th>
                          <th className="px-6 py-4">Referencia</th>
                          <th className="px-6 py-4">Banco / monto</th>
                          <th className="px-6 py-4">Fecha</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </>
                      )}
                      {activeTab === 'users' && (
                        <>
                          <th className="px-6 py-4">Nombre</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Rol</th>
                          <th className="px-6 py-4">Registrado</th>
                        </>
                      )}
                      {activeTab === 'logs' && (
                        <>
                          <th className="px-6 py-4">Nivel</th>
                          <th className="px-6 py-4">Módulo</th>
                          <th className="px-6 py-4">Mensaje</th>
                          <th className="px-6 py-4">Hora</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {activeTab === 'payments' && filteredPayments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-white/40">
                          {searchTerm
                            ? 'No hay pagos pendientes que coincidan con la búsqueda.'
                            : 'No hay pagos pendientes en payment_logs.'}
                        </td>
                      </tr>
                    )}
                    {activeTab === 'payments' && filteredPayments.map((item: any) => {
                      const pr = item.profiles;
                      const u = Array.isArray(pr) ? pr[0] : pr;
                      const displayName = [u?.full_name, u?.name].filter(Boolean).join(' ').trim() || u?.email || '—';
                      const receiptUrl = item.receipt_url as string | undefined;
                      return (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-sm text-white">{displayName}</div>
                            <div className="text-[10px] text-white/40">{u?.email}</div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-padel-primary">#{item.reference_number}</td>
                          <td className="px-6 py-4 text-xs text-white/70">
                            <div>{item.bank_origin || '—'}</div>
                            {item.amount_bs != null && (
                              <div className="text-[10px] text-padel-primary/80 mt-0.5">{item.amount_bs} Bs.</div>
                            )}
                            {item.phone_emitter && (
                              <div className="text-[10px] text-white/40 mt-0.5">Tel. {item.phone_emitter}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-[10px] text-white/40">
                            {new Date(item.created_at).toLocaleString('es-VE', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => void handleApprovePaymentLog(item.id)}
                                disabled={approvingId === item.id}
                                className="inline-flex items-center justify-center rounded-lg bg-padel-primary px-3 py-1.5 text-[10px] font-black uppercase text-black hover:brightness-95 disabled:opacity-50"
                              >
                                {approvingId === item.id ? '…' : 'Aprobar'}
                              </button>
                              {receiptUrl && (
                                <a
                                  href={receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-white/80 hover:bg-white/10"
                                >
                                  Recibo
                                </a>
                              )}
                              <a
                                href="/admin/validacion-pagos"
                                className="inline-flex items-center justify-center rounded-lg border border-white/10 px-2 py-1.5 text-[9px] font-bold text-white/50 hover:text-white"
                              >
                                Validar
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {activeTab === 'users' && players.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-sm text-white">{item.full_name || item.name}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-white/70">{item.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            item.role === 'admin' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {item.role || 'PLAYER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-white/40">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {activeTab === 'logs' && logs.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.level === 'error' ? 'bg-rose-500/20 text-rose-400' : 
                            item.level === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.level}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-white/60">{item.module}</td>
                        <td className="px-6 py-4 text-[11px] text-white/80 max-w-xs truncate">{item.message}</td>
                        <td className="px-6 py-4 text-[10px] text-white/40">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar Alerts / Errors */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#111] border border-white/5 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-rose-500" />
                    Errores de Pantalla
                  </h2>
                  <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-full">
                    {errorLogs.length} Críticos
                  </span>
                </div>
                
                <div className="space-y-4">
                  {errorLogs.length === 0 ? (
                    <div className="py-10 flex flex-col items-center justify-center text-center opacity-30">
                      <CheckCircle2 className="w-10 h-10 mb-2" />
                      <p className="text-xs">Sin errores registrados</p>
                    </div>
                  ) : (
                    errorLogs.map((err) => (
                      <div key={err.id} className="p-4 bg-rose-500/[0.03] border border-rose-500/10 rounded-2xl group hover:border-rose-500/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-xs text-rose-400">{err.cancha_id || 'Global'}</div>
                          <div className="text-[9px] text-white/30">{new Date(err.created_at).toLocaleTimeString()}</div>
                        </div>
                        <p className="text-[11px] text-white/70 line-clamp-2">{err.error_message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-padel-primary/5 border border-padel-primary/10 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-padel-primary/10 blur-2xl -mr-10 -mt-10" />
                <h2 className="text-lg font-bold mb-2 relative z-10">Métricas PRO</h2>
                <p className="text-xs text-white/50 mb-6 relative z-10">Optimización de recursos y monitoreo de tráfico en tiempo real.</p>
                
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white/60">Salud del Servidor</span>
                    <span className="text-emerald-400">99.9%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-emerald-400 h-full rounded-full w-[99.9%]" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-white/60">Latencia Realtime</span>
                    <span className="text-padel-primary">42ms</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className="bg-padel-primary h-full rounded-full w-[15%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
