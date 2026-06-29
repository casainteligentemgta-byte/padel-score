'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAuthHeaders } from '@/lib/apiAuth';
import {
  type ClubStaffRow,
} from '@/lib/expressClubStaff';
import { EXPRESS_VENUE_OPTIONS } from '@/lib/expressVenueCourts';
import { expressVenuePathSlug } from '@/lib/expressShortUrl';

export default function AdminExpressStaffPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staff, setStaff] = useState<ClubStaffRow[]>([]);
  const [filterClub, setFilterClub] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formClub, setFormClub] = useState(EXPRESS_VENUE_OPTIONS[0] ?? '');

  const venueOptions = useMemo(() => [...EXPRESS_VENUE_OPTIONS], []);

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const qs = filterClub ? `?club=${encodeURIComponent(filterClub)}` : '';
      const res = await fetch(`/api/admin/express/staff${qs}`, { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setStaff(Array.isArray(data.staff) ? data.staff : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [filterClub]);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!authLoading && isAdmin) loadStaff();
  }, [authLoading, isAdmin, loadStaff]);

  const handleCreate = async () => {
    if (!formName.trim() || !formClub) return;
    setSaving(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/express/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ name: formName.trim(), club_slug: formClub }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setFormName('');
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  };

  const patchStaff = async (id: string, body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/express/staff', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar a ${name}?`)) return;
    setSaving(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/admin/express/staff?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      await loadStaff();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  };

  const copyLogin = async (row: ClubStaffRow) => {
    const text = `/login ${row.auth_code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((prev) => (prev === row.id ? null : prev)), 1600);
    } catch {
      window.prompt('Copia este comando:', text);
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-8 w-8 animate-spin text-padel-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-padel-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Admin
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-padel-primary">
              <Bot className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Express</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Manejadores Telegram</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              Crea un código por persona. El manejador envía <code className="text-padel-primary">/login CODIGO</code>{' '}
              al bot y recibe las URLs de su sede (BD/C1, FK/C2…) más botones QR y Reset.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadStaff()}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:border-padel-primary/40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {error ? (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest">
              <UserPlus className="h-4 w-4 text-padel-primary" />
              Nuevo manejador
            </h2>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">
              Nombre
            </label>
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Ej. Carlos — recepción"
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-padel-primary/50"
            />
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">
              Sede
            </label>
            <select
              value={formClub}
              onChange={(e) => setFormClub(e.target.value)}
              className="mb-4 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-padel-primary/50"
            >
              {venueOptions.map((venue) => (
                <option key={venue} value={venue}>
                  {venue} ({expressVenuePathSlug(venue)})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving || !formName.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-padel-primary px-4 py-3 text-sm font-black uppercase tracking-widest text-black disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generar código
            </button>
          </div>

          <div className="rounded-2xl border border-padel-primary/20 bg-padel-primary/5 p-5">
            <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-padel-primary">
              Flujo en el club
            </h2>
            <ol className="space-y-3 text-sm text-white/70">
              <li>
                <span className="font-bold text-white">1.</span> Creas al manejador aquí → obtienes código tipo{' '}
                <code className="text-padel-primary">BD-A7K3</code>
              </li>
              <li>
                <span className="font-bold text-white">2.</span> Le envías el comando{' '}
                <code className="text-padel-primary">/login BD-A7K3</code> por Telegram
              </li>
              <li>
                <span className="font-bold text-white">3.</span> El bot responde con URLs{' '}
                <code className="text-padel-primary">smartpadel58.com/BD/C1</code> y botones QR/Reset
              </li>
              <li>
                <span className="font-bold text-white">4.</span> Abre esa URL en el navegador de cada TV del club
              </li>
            </ol>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Filtrar sede</label>
          <select
            value={filterClub}
            onChange={(e) => setFilterClub(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
          >
            <option value="">Todas</option>
            {venueOptions.map((venue) => (
              <option key={venue} value={venue}>
                {venue}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-padel-primary" />
          </div>
        ) : staff.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-white/40">
            No hay manejadores registrados.
          </p>
        ) : (
          <div className="space-y-3">
            {staff.map((row) => {
              const pathCode = expressVenuePathSlug(row.club_slug);
              const linked = row.telegram_chat_id != null;
              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{row.name}</span>
                      {!row.is_active ? (
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">
                          Inactivo
                        </span>
                      ) : null}
                      {linked ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
                          <Link2 className="h-3 w-3" />
                          Telegram vinculado
                        </span>
                      ) : (
                        <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-200">
                          Pendiente login
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-white/50">
                      {row.club_slug} · <span className="font-mono text-padel-primary">{pathCode}</span>
                    </p>
                    <p className="mt-2 font-mono text-sm text-padel-primary">/login {row.auth_code}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyLogin(row)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-padel-primary/40"
                    >
                      {copiedId === row.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      Copiar /login
                    </button>
                    {linked ? (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => patchStaff(row.id, { unlink_telegram: true })}
                        className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-yellow-500/40"
                      >
                        Desvincular
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => patchStaff(row.id, { regenerate_code: true })}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-white/30"
                    >
                      Nuevo código
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => patchStaff(row.id, { is_active: !row.is_active })}
                      className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-wider"
                    >
                      {row.is_active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleDelete(row.id, row.name)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold uppercase tracking-wider text-red-300"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
