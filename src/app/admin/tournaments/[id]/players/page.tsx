'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { useRouteSegment } from '@/lib/useRouteSegment';
import Sidebar from '@/components/Sidebar';

type ToastState = { type: 'success' | 'error'; text: string } | null;

export default function AdminTournamentPlayersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const tournamentId = useRouteSegment('id');
  const nameRef = useRef<HTMLInputElement | null>(null);

  const [loadingTournament, setLoadingTournament] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [tournament, setTournament] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryKey, setCategoryKey] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!tournamentId) return;
    let mounted = true;
    (async () => {
      try {
        setLoadingTournament(true);
        const t = await dataService.getTournament(tournamentId);
        if (!mounted) return;
        setTournament(t || null);
        const firstCat =
          Array.isArray(t?.inscriptionCategories) && t.inscriptionCategories.length > 0
            ? String(t.inscriptionCategories[0]?.key || '')
            : '';
        setCategoryKey(firstCat);
      } finally {
        if (mounted) setLoadingTournament(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [tournamentId]);

  const categories = useMemo(() => {
    const raw = Array.isArray(tournament?.inscriptionCategories)
      ? tournament.inscriptionCategories
      : Array.isArray(tournament?.categories)
      ? tournament.categories
      : [];
    return raw
      .map((c: any) => ({
        key: String(c?.key || c?.id || c?.category || ''),
        label: String(c?.name || c?.key || c?.id || c?.category || ''),
      }))
      .filter((c: { key: string }) => c.key);
  }, [tournament]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!tournamentId || !fullName.trim() || !email.trim()) return;

    setSaving(true);
    setToast(null);
    try {
      const res = await fetch('/api/admin/quick-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId,
          categoryKey: categoryKey || undefined,
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'No se pudo registrar.');

      setToast({ type: 'success', text: 'Jugador añadido al sistema y al torneo' });
      setFullName('');
      setEmail('');
      setPhone('');
      window.setTimeout(() => {
        nameRef.current?.focus();
      }, 0);
    } catch (err: any) {
      setToast({ type: 'error', text: err?.message || 'Error inesperado.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loadingTournament) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-padel-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-black uppercase italic">
              Registro Rápido de Jugadores
            </h1>
            <p className="text-xs text-white/55 uppercase tracking-wider mt-2">
              Torneo: {tournament?.name || tournamentId}
            </p>
          </header>

          <form
            onSubmit={onSubmit}
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 space-y-4"
          >
            <div>
              <label className="text-[10px] uppercase text-white/65">Full Name *</label>
              <input
                ref={nameRef}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Nombre y apellido"
                className="mt-1 w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-white/65">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="correo@dominio.com"
                className="mt-1 w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase text-white/65">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 ..."
                className="mt-1 w-full bg-black/35 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
              />
            </div>

            {categories.length > 0 && (
              <div>
                <label className="text-[10px] uppercase text-white/65">Categoría</label>
                <select
                  value={categoryKey}
                  onChange={(e) => setCategoryKey(e.target.value)}
                  className="mt-1 w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-white/25"
                >
                  {categories.map((c) => (
                    <option key={c.key} value={c.key} className="bg-zinc-950 text-white">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {toast && (
              <div
                className={`rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2 border ${
                  toast.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    : 'bg-red-500/10 text-red-300 border-red-500/30'
                }`}
              >
                {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {toast.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !fullName.trim() || !email.trim()}
              className="w-full rounded-xl py-3 text-black text-xs md:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ccff00' }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus size={14} />}
              + Registrar e Inscribir
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

