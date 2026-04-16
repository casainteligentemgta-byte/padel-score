'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Building2,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Link2,
    CheckCircle2,
    XCircle,
    Upload,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, type VenueRecord } from '@/lib/dataService';

type VenueForm = {
    name: string;
    slug: string;
    city: string;
    rif: string;
    contact: string;
    phone: string;
    email: string;
    instagram: string;
    brandPrimary: string;
    brandSecondary: string;
    courtsCount: number;
    isActive: boolean;
    logoUrl: string;
};

const DEFAULT_FORM: VenueForm = {
    name: '',
    slug: '',
    city: '',
    rif: '',
    contact: '',
    phone: '',
    email: '',
    instagram: '',
    brandPrimary: '#CCFF00',
    brandSecondary: '#0A0A0A',
    courtsCount: 1,
    isActive: true,
    logoUrl: '',
};

function slugify(input: string): string {
    return input
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function AdminSedesPage() {
    const router = useRouter();
    const { isAdmin, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [venues, setVenues] = useState<VenueRecord[]>([]);
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<VenueForm>(DEFAULT_FORM);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.replace('/');
        }
    }, [authLoading, isAdmin, router]);

    const loadVenues = async () => {
        setLoading(true);
        try {
            const rows = await dataService.listVenues();
            setVenues(rows);
        } catch (e: any) {
            setError(e?.message || 'No se pudieron cargar las sedes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) void loadVenues();
    }, [isAdmin]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return venues;
        return venues.filter((v) =>
            [v.name, v.city || '', v.slug].join(' ').toLowerCase().includes(q)
        );
    }, [venues, query]);

    const quickLinks = (slug: string, count: number) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://smartpadel58.com';
        const safeCount = Math.max(0, Number(count || 0));
        return Array.from({ length: safeCount }, (_, i) => `${origin}/s/${slug}/c${i + 1}`);
    };

    const resetForm = () => {
        setForm(DEFAULT_FORM);
        setLogoFile(null);
        setEditingId(null);
    };

    const startCreate = () => {
        resetForm();
        setShowForm(true);
        setError(null);
        setOk(null);
    };

    const startEdit = (v: VenueRecord) => {
        setEditingId(v.id);
        setForm({
            name: v.name,
            slug: v.slug,
            city: v.city || '',
            rif: v.rif || '',
            contact: v.contact || '',
            phone: v.phone || '',
            email: v.email || '',
            instagram: v.instagram || '',
            brandPrimary: v.brandPrimary || '#CCFF00',
            brandSecondary: v.brandSecondary || '#0A0A0A',
            courtsCount: Number(v.courtsCount || 1),
            isActive: v.isActive,
            logoUrl: v.logoUrl || '',
        });
        setLogoFile(null);
        setShowForm(true);
        setError(null);
        setOk(null);
    };

    const handleSave = async () => {
        setError(null);
        setOk(null);
        const name = form.name.trim();
        const slug = slugify(form.slug || form.name);
        if (!name) return setError('El nombre es obligatorio.');
        if (!slug) return setError('El slug no puede estar vacío.');
        if (form.courtsCount < 1) return setError('La cantidad de canchas debe ser mayor o igual a 1.');

        setSaving(true);
        try {
            const available = await dataService.isVenueSlugAvailable(slug, editingId || undefined);
            if (!available) {
                setError('El slug ya existe. Usa otro.');
                return;
            }

            let logoUrl = form.logoUrl || '';
            if (logoFile) {
                const ext = logoFile.name.split('.').pop()?.toLowerCase() || 'png';
                const path = `venues/logos/${slug}-${Date.now()}.${ext}`;
                logoUrl = await dataService.uploadFile(logoFile, path, 'public');
            }

            const payload = {
                name,
                slug,
                city: form.city.trim() || null,
                rif: form.rif.trim() || null,
                contact: form.contact.trim() || null,
                phone: form.phone.trim() || null,
                email: form.email.trim() || null,
                instagram: form.instagram.trim() || null,
                brandPrimary: form.brandPrimary,
                brandSecondary: form.brandSecondary,
                courtsCount: Number(form.courtsCount),
                isActive: form.isActive,
                logoUrl: logoUrl || null,
            };

            if (editingId) {
                await dataService.updateVenue(editingId, payload);
                setOk('Sede actualizada correctamente.');
            } else {
                await dataService.createVenue(payload as any);
                setOk('Sede creada correctamente.');
            }

            await loadVenues();
            setShowForm(false);
            resetForm();
        } catch (e: any) {
            setError(e?.message || 'No se pudo guardar la sede.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirm = window.confirm('¿Seguro que deseas eliminar esta sede?');
        if (!confirm) return;
        setError(null);
        setOk(null);
        try {
            await dataService.deleteVenue(id);
            setVenues((prev) => prev.filter((v) => v.id !== id));
            setOk('Sede eliminada.');
        } catch (e: any) {
            setError(e?.message || 'No se pudo eliminar la sede.');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-[#050505] p-6">
                <div className="mx-auto max-w-6xl space-y-4">
                    <div className="h-10 w-64 animate-pulse rounded-xl bg-white/10" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                    ))}
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit">
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">
                            Módulo de <span className="text-[#CCFF00]">Sedes</span>
                        </h1>
                        <p className="mt-1 text-sm text-zinc-400">CRUD de clubes y branding.</p>
                    </div>
                    <button
                        type="button"
                        onClick={startCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#CCFF00] px-5 py-3 text-sm font-black uppercase text-black"
                    >
                        <Plus className="h-4 w-4" /> Añadir nueva sede
                    </button>
                </div>

                <div className="mb-4">
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar por nombre, ciudad o slug..."
                        className="w-full rounded-2xl border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm outline-none focus:border-[#CCFF00]/60"
                    />
                </div>

                {error && (
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        <XCircle className="h-4 w-4" /> {error}
                    </div>
                )}
                {ok && (
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[#CCFF00]/20 bg-[#CCFF00]/10 px-4 py-3 text-sm text-[#CCFF00]">
                        <CheckCircle2 className="h-4 w-4" /> {ok}
                    </div>
                )}

                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-zinc-400">
                            <tr>
                                <th className="px-4 py-3">Club</th>
                                <th className="px-4 py-3">Ciudad</th>
                                <th className="px-4 py-3">Canchas</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v) => (
                                <tr key={v.id} className="border-t border-white/5 bg-black/20">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {v.logoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={v.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-lg bg-white/10" />
                                            )}
                                            <div>
                                                <p className="font-bold">{v.name}</p>
                                                <p className="text-xs text-zinc-500">{v.slug}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{v.city || '—'}</td>
                                    <td className="px-4 py-3">{v.courtsCount}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${v.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-500/20 text-zinc-300'}`}>
                                            {v.isActive ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => startEdit(v)} className="rounded-lg border border-white/10 p-2 hover:bg-white/5">
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => void handleDelete(v.id)} className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                    {filtered.map((v) => (
                        <motion.article key={v.id} layout className="rounded-2xl border border-white/10 bg-black/25 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-base font-black">{v.name}</p>
                                    <p className="truncate text-xs text-zinc-500">{v.city || 'Sin ciudad'} · {v.courtsCount} canchas</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${v.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-500/20 text-zinc-300'}`}>
                                    {v.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <button onClick={() => startEdit(v)} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold">
                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                </button>
                                <button onClick={() => void handleDelete(v.id)} className="inline-flex items-center gap-1 rounded-xl border border-red-500/20 px-3 py-2 text-xs font-bold text-red-300">
                                    <Trash2 className="h-3.5 w-3.5" /> Borrar
                                </button>
                            </div>

                            <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
                                <p className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                    <Link2 className="h-3.5 w-3.5" /> Enlaces rápidos
                                </p>
                                <div className="space-y-1">
                                    {quickLinks(v.slug, v.courtsCount).slice(0, 3).map((l) => (
                                        <p key={l} className="truncate text-xs text-[#CCFF00]">{l}</p>
                                    ))}
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
                        <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#090909] p-5 sm:p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-black uppercase italic tracking-tight">
                                    {editingId ? 'Editar sede' : 'Nueva sede'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="rounded-lg border border-white/10 px-3 py-1 text-sm">
                                    Cerrar
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <Input label="Nombre" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v, slug: p.slug ? p.slug : slugify(v) }))} />
                                <Input label="Slug" value={form.slug} onChange={(v) => setForm((p) => ({ ...p, slug: slugify(v) }))} />
                                <Input label="Ciudad" value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} />
                                <Input label="RIF" value={form.rif} onChange={(v) => setForm((p) => ({ ...p, rif: v }))} />
                                <Input label="Contacto" value={form.contact} onChange={(v) => setForm((p) => ({ ...p, contact: v }))} />
                                <Input label="Teléfono" value={form.phone} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
                                <Input label="Email" value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
                                <Input label="Instagram" value={form.instagram} onChange={(v) => setForm((p) => ({ ...p, instagram: v }))} />
                                <Input
                                    label="Cantidad de canchas"
                                    type="number"
                                    value={String(form.courtsCount)}
                                    onChange={(v) => setForm((p) => ({ ...p, courtsCount: Math.max(1, Number(v || 1)) }))}
                                />
                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                    <input
                                        id="venue-active"
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
                                        className="h-4 w-4 accent-[#CCFF00]"
                                    />
                                    <label htmlFor="venue-active" className="text-sm font-bold">Sede activa</label>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Color primario</label>
                                    <input type="color" value={form.brandPrimary} onChange={(e) => setForm((p) => ({ ...p, brandPrimary: e.target.value }))} />
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">Color secundario</label>
                                    <input type="color" value={form.brandSecondary} onChange={(e) => setForm((p) => ({ ...p, brandSecondary: e.target.value }))} />
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Logo del club</p>
                                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold">
                                    <Upload className="h-4 w-4" /> Subir logo
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                                {logoFile ? (
                                    <p className="mt-2 text-xs text-zinc-400">{logoFile.name}</p>
                                ) : form.logoUrl ? (
                                    <p className="mt-2 truncate text-xs text-[#CCFF00]">{form.logoUrl}</p>
                                ) : null}
                            </div>

                            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Enlaces rápidos</p>
                                <div className="space-y-1">
                                    {quickLinks(form.slug || slugify(form.name), form.courtsCount).slice(0, 5).map((l) => (
                                        <p key={l} className="truncate text-xs text-[#CCFF00]">{l}</p>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5 flex flex-wrap justify-end gap-2">
                                <button onClick={() => setShowForm(false)} className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold">
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => void handleSave()}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-2xl bg-[#CCFF00] px-5 py-2 text-sm font-black uppercase text-black disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Building2 className="h-4 w-4" />}
                                    Guardar sede
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

function Input({
    label,
    value,
    onChange,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-zinc-400">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0b0b0b] px-3 py-2 text-sm outline-none focus:border-[#CCFF00]/60"
            />
        </div>
    );
}

