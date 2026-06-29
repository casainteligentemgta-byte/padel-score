'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Bot,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Link2,
  Loader2,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  Users,
  Wand2,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getAuthHeaders } from '@/lib/apiAuth';
import { type ClubStaffRow } from '@/lib/expressClubStaff';
import {
  buildClubStaffShareMessage,
  CLUB_STAFF_ROLE_PRESETS,
  groupClubStaffByVenue,
  rosterSummary,
  type ClubStaffRosterVenue,
} from '@/lib/expressClubStaffRoster';
import { EXPRESS_VENUE_OPTIONS } from '@/lib/expressVenueCourts';

type QuickAddState = Record<string, { name: string; role: string }>;

function StaffRowCard({
  row,
  saving,
  copiedId,
  onCopy,
  onPatch,
  onDelete,
}: {
  row: ClubStaffRow;
  saving: boolean;
  copiedId: string | null;
  onCopy: (row: ClubStaffRow) => void;
  onPatch: (id: string, body: Record<string, unknown>) => void;
  onDelete: (id: string, name: string) => void;
}) {
  const linked = row.telegram_chat_id != null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <input
            defaultValue={row.name}
            onBlur={(e) => {
              const next = e.target.value.trim();
              if (next && next !== row.name) onPatch(row.id, { name: next });
            }}
            className="min-w-[8rem] rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-sm font-bold text-white outline-none focus:border-white/20"
          />
          {row.role_label ? (
            <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-white/60">
              {row.role_label}
            </span>
          ) : null}
          {!row.is_active ? (
            <span className="rounded bg-red-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-red-300">
              Inactivo
            </span>
          ) : linked ? (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-300">
              <Link2 className="h-3 w-3" />
              Vinculado
            </span>
          ) : (
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-yellow-200">
              Pendiente
            </span>
          )}
        </div>
        <p className="mt-1 font-mono text-xs text-padel-primary">/login {row.auth_code}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={row.role_label ?? ''}
          onChange={(e) => onPatch(row.id, { role_label: e.target.value })}
          disabled={saving}
          className="rounded-lg border border-white/10 bg-black/40 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider"
        >
          <option value="">Sin rol</option>
          {CLUB_STAFF_ROLE_PRESETS.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onCopy(row)}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider hover:border-padel-primary/40"
        >
          {copiedId === row.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          /login
        </button>
        {linked ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => onPatch(row.id, { unlink_telegram: true })}
            className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider"
          >
            Desvincular
          </button>
        ) : null}
        <button
          type="button"
          disabled={saving}
          onClick={() => onPatch(row.id, { regenerate_code: true })}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider"
        >
          Nuevo código
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onPatch(row.id, { is_active: !row.is_active })}
          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider"
        >
          {row.is_active ? 'Off' : 'On'}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => onDelete(row.id, row.name)}
          className="rounded-lg border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ClubRosterCard({
  venue,
  expanded,
  onToggle,
  quickAdd,
  onQuickAddChange,
  onAdd,
  onInit,
  onShare,
  saving,
  copiedId,
  onCopy,
  onPatch,
  onDelete,
  shareCopied,
}: {
  venue: ClubStaffRosterVenue;
  expanded: boolean;
  onToggle: () => void;
  quickAdd: { name: string; role: string };
  onQuickAddChange: (next: { name: string; role: string }) => void;
  onAdd: () => void;
  onInit: () => void;
  onShare: () => void;
  saving: boolean;
  copiedId: string | null;
  onCopy: (row: ClubStaffRow) => void;
  onPatch: (id: string, body: Record<string, unknown>) => void;
  onDelete: (id: string, name: string) => void;
  shareCopied: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left hover:bg-white/[0.03]"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-padel-primary" />
            <span className="font-bold text-white">{venue.venue}</span>
            <span className="rounded bg-padel-primary/20 px-2 py-0.5 font-mono text-xs text-padel-primary">
              {venue.pathCode}
            </span>
            <span className="text-xs text-white/40">{venue.courtCount} canchas</span>
          </div>
          <p className="mt-1 text-xs text-white/45">
            {venue.staff.length} manejador{venue.staff.length !== 1 ? 'es' : ''} · {venue.linkedCount} vinculado
            {venue.linkedCount !== 1 ? 's' : ''} a Telegram
          </p>
        </div>
        {expanded ? <ChevronUp className="h-5 w-5 text-white/40" /> : <ChevronDown className="h-5 w-5 text-white/40" />}
      </button>

      {expanded ? (
        <div className="space-y-3 border-t border-white/10 px-4 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-cyan-200"
            >
              {shareCopied ? <Check className="h-3.5 w-3.5" /> : <MessageCircle className="h-3.5 w-3.5" />}
              Copiar guía del club
            </button>
            {venue.staff.length === 0 ? (
              <button
                type="button"
                disabled={saving}
                onClick={onInit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-padel-primary/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-padel-primary"
              >
                <Wand2 className="h-3.5 w-3.5" />
                Crear encargado por defecto
              </button>
            ) : null}
          </div>

          <div className="grid gap-2 rounded-xl border border-dashed border-white/10 p-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={quickAdd.name}
              onChange={(e) => onQuickAddChange({ ...quickAdd, name: e.target.value })}
              placeholder="Nombre del manejador"
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-padel-primary/50"
            />
            <select
              value={quickAdd.role}
              onChange={(e) => onQuickAddChange({ ...quickAdd, role: e.target.value })}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none"
            >
              <option value="">Rol (opcional)</option>
              {CLUB_STAFF_ROLE_PRESETS.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={saving || !quickAdd.name.trim()}
              onClick={onAdd}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-padel-primary px-4 py-2 text-xs font-black uppercase tracking-widest text-black disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Añadir
            </button>
          </div>

          {venue.staff.length === 0 ? (
            <p className="py-4 text-center text-sm text-white/35">Este club aún no tiene manejadores.</p>
          ) : (
            <div className="space-y-2">
              {venue.staff.map((row) => (
                <StaffRowCard
                  key={row.id}
                  row={row}
                  saving={saving}
                  copiedId={copiedId}
                  onCopy={onCopy}
                  onPatch={onPatch}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminExpressStaffPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [staff, setStaff] = useState<ClubStaffRow[]>([]);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopiedVenue, setShareCopiedVenue] = useState<string | null>(null);
  const [expandedVenues, setExpandedVenues] = useState<Record<string, boolean>>({});
  const [quickAddByVenue, setQuickAddByVenue] = useState<QuickAddState>({});

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/express/staff', { headers });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setStaff(Array.isArray(data.staff) ? data.staff : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) router.replace('/');
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (!authLoading && isAdmin) loadStaff();
  }, [authLoading, isAdmin, loadStaff]);

  const roster = useMemo(() => groupClubStaffByVenue(staff), [staff]);
  const summary = useMemo(() => rosterSummary(staff), [staff]);

  const filteredRoster = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roster;
    return roster
      .map((venue) => ({
        ...venue,
        staff: venue.staff.filter(
          (row) =>
            row.name.toLowerCase().includes(q) ||
            (row.role_label ?? '').toLowerCase().includes(q) ||
            row.auth_code.toLowerCase().includes(q) ||
            venue.venue.toLowerCase().includes(q) ||
            venue.pathCode.toLowerCase().includes(q),
        ),
      }))
      .filter(
        (venue) =>
          venue.staff.length > 0 ||
          venue.venue.toLowerCase().includes(q) ||
          venue.pathCode.toLowerCase().includes(q),
      );
  }, [roster, search]);

  const patchStaff = async (id: string, body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
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

  const createStaff = async (clubSlug: string, name: string, roleLabel: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/express/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          club_slug: clubSlug,
          name: name.trim(),
          role_label: roleLabel.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      setQuickAddByVenue((prev) => ({ ...prev, [clubSlug]: { name: '', role: '' } }));
      setExpandedVenues((prev) => ({ ...prev, [clubSlug]: true }));
      await loadStaff();
      setSuccess(`Manejador creado en ${clubSlug}.`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  };

  const initClub = async (clubSlug?: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/admin/express/staff/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(clubSlug ? { club_slug: clubSlug } : {}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
      if (clubSlug) setExpandedVenues((prev) => ({ ...prev, [clubSlug]: true }));
      await loadStaff();
      setSuccess(String(data.message ?? 'Listo.'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'No se pudo inicializar');
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
    try {
      await navigator.clipboard.writeText(`/login ${row.auth_code}`);
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((prev) => (prev === row.id ? null : prev)), 1600);
    } catch {
      window.prompt('Copia:', `/login ${row.auth_code}`);
    }
  };

  const copyClubGuide = async (venue: ClubStaffRosterVenue) => {
    try {
      await navigator.clipboard.writeText(buildClubStaffShareMessage(venue));
      setShareCopiedVenue(venue.venue);
      setTimeout(() => setShareCopiedVenue((prev) => (prev === venue.venue ? null : prev)), 2000);
    } catch {
      window.prompt('Copia la guía:', buildClubStaffShareMessage(venue));
    }
  };

  const getQuickAdd = (venue: string) => quickAddByVenue[venue] ?? { name: '', role: '' };

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

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2 text-padel-primary">
              <Bot className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Express</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Lista de manejadores por club</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              Un registro por persona y sede. Cada manejador vincula Telegram con{' '}
              <code className="text-padel-primary">/login CODIGO</code> y controla QR/Reset de su club.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => initClub()}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl border border-padel-primary/30 px-4 py-2 text-xs font-bold uppercase tracking-widest text-padel-primary"
            >
              <Wand2 className="h-4 w-4" />
              Inicializar clubes vacíos
            </button>
            <button
              type="button"
              onClick={() => loadStaff()}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Manejadores', value: summary.total, icon: Users },
            { label: 'Activos', value: summary.active, icon: UserPlus },
            { label: 'En Telegram', value: summary.linked, icon: Link2 },
            { label: 'Clubes con staff', value: `${summary.clubsWithStaff}/${EXPRESS_VENUE_OPTIONS.length}`, icon: Building2 },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className="text-2xl font-black text-white">{item.value}</p>
            </div>
          ))}
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
        {success ? (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="relative mb-6">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar club, nombre, rol o código…"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm outline-none focus:border-padel-primary/50"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-padel-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRoster.map((venue) => (
              <ClubRosterCard
                key={venue.venue}
                venue={venue}
                expanded={expandedVenues[venue.venue] ?? venue.staff.length > 0}
                onToggle={() =>
                  setExpandedVenues((prev) => ({ ...prev, [venue.venue]: !prev[venue.venue] }))
                }
                quickAdd={getQuickAdd(venue.venue)}
                onQuickAddChange={(next) =>
                  setQuickAddByVenue((prev) => ({ ...prev, [venue.venue]: next }))
                }
                onAdd={() => {
                  const qa = getQuickAdd(venue.venue);
                  void createStaff(venue.venue, qa.name, qa.role);
                }}
                onInit={() => initClub(venue.venue)}
                onShare={() => copyClubGuide(venue)}
                saving={saving}
                copiedId={copiedId}
                onCopy={copyLogin}
                onPatch={patchStaff}
                onDelete={handleDelete}
                shareCopied={shareCopiedVenue === venue.venue}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
